package com.shallowsky.FeedViewer;

/**
 * FeedFetcher: fetch a directory of feeds (already converted from RSS)
 * from a server.
 * ServerURL: the base URL of the server.
 * LocalDir: the place where we'll save the feeds.
 *
 * First, we initiate the feed by fetching the special url
 *   $ServerURL/feedme/urlrss.cgi?xtraurls=STR
 * where STR is a concatenation of extra URLS wanted,
 * URL encoded and connected by the string '%0a'.
 * For instance,
 *   /feedme/urlrss.cgi?xtraurls=http%3A%2F%2Fblog.arduino.cc%2F2013%2F07%2F10%2Fsend-in-the-clones%2F%0ahttp%3A%2F%2Fread.bi%2F10Lbfh9%0ahttp%3A%2F%2Fwww.popsci.com%2Ftechnology%2Farticle%2F2013-07%2Fdrones-civil-war%0ahttp%3A%2F%2Fwww.thisamericanlife.org%2Fblog%2F2015%2F05%2Fcanvassers-study-in-episode-555-has-been-retracted
 * The saved URLs come from the (line separated) file
 * /mnt/extSdCard/Android/data/com.shallowsky.FeedViewer/saved-urls.
 *
 * Once the initial urlrss.cgi URL has been requested,
 * we wait for it to finish.
 * baseurl = serverurl + "/feeds/" + strftime("%m-%d-%a")
 * We wait for baseurl/LOG to appear,
 * meanwhile showing progress by fetching baseurl and parsing it
 * to show which directories have appeared.
 *
 * Finally, when LOG has appeared, the feeds are ready to download.
 * Download everything inside baseurl.
 * This might be tricky because we can't ls the directories inside it
 * (they have index.html files inside them); we can either fetch each
 * index.html file, parse it and fetch all the links inside,
 * or modify urlrss on the server to put a manifest telling us
 * what to download.
 *
 * So far, of course, this class does none of this. It just demonstrates
 * how to fetch a single test file.
 */

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.io.Reader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.BufferedReader;

import android.os.AsyncTask;

import java.net.URL;
import java.net.HttpURLConnection;
import java.net.URLEncoder;

import android.app.Activity;

import android.net.ConnectivityManager;
import android.net.NetworkInfo;

import android.content.Context;

import android.util.Log;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Scanner;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.text.SimpleDateFormat;
import android.text.Html;

// https://developer.android.com/training/basics/network-ops/index.html

public class FeedFetcher {

    Context mContext;
    String mServerUrl;
    String mLocalDir;
    FeedProgress mFeedProgress;
    FetchFeedsTask mFetchTask = null;

    public FeedFetcher(Context context, String serverurl, String localdir,
                       FeedProgress fp) {
        mContext = context;
        mServerUrl = serverurl;
        mLocalDir = localdir;
        mFeedProgress = fp;

        Log.d("FeedFetcher", "\nStarting FeedFetcher; logging progress");
        logProgress("Starting FeedFetcher");
    }

    public void setServerURL(String serverurl) {
        mServerUrl = serverurl;
    }

    // Fetch feeds. Return true for success or false otherwise.
    // We're still on the main thread here.
    public Boolean fetchFeeds() {
        Log.d("FeedFetcher", "Trying to fetch feeds.");

        // Before attempting to fetch anything, makes sure the net's up:
        ConnectivityManager connMgr = (ConnectivityManager) 
            mContext.getSystemService(Context.CONNECTIVITY_SERVICE);
        Log.d("FeedViewer", "Got connectivity service: " + connMgr);
        // Next line crashes. Why?
        NetworkInfo networkInfo = connMgr.getActiveNetworkInfo();

        // If the net is up, start an async task to fetch the URL:
        if (networkInfo == null || !networkInfo.isConnected()) {
            logProgress("No network connection available.");
            return false;
        }

        String urlrssURL = mServerUrl + "/feedme/testurlrss.cgi";
        //String urlrssURL = mServerUrl + "/feedme/urlrss.cgi";
        Boolean haveURLs = false;

        // Read any saved URLs we need to pass to urlrss.
        // Of course this should be relative to wherever we're reading feeds,
        // or have several options of path. Eventually.
        String feedfile = "/mnt/extSdCard/Android/data/com.shallowsky.FeedViewer/saved-urls";
        try {
            InputStream fis = new FileInputStream(feedfile);
            InputStreamReader isr = new InputStreamReader(fis);
                                                          //, Charset.forName("UTF-8"));
            BufferedReader br = new BufferedReader(isr);
            String line;
            while ((line = br.readLine()) != null) {
                if (haveURLs)
                    urlrssURL += "%0A";
                else {
                    urlrssURL += "?xtraurls=";
                    haveURLs = true;
                }
                urlrssURL += URLEncoder.encode(line, "UTF-8");
            }
        } catch(Throwable t) {
            logProgress("Couldn't read saved-urls");
        }

        mFetchTask = new FetchFeedsTask();
        mFetchTask.execute(urlrssURL);

        // Now wait for the task to complete.
        // The UI can still send a signal to us to stop.
        // XXX

        // If we're finished, the feeds task shouldn't be running any more.
        mFetchTask = null;
        return true;
    }

    // Most of FeedFetcher runs as an AsyncTask,
    // comuunicating back to the parent thread about its progress.
    // Within the AsyncTask, we'll just wait for feeds.
    // FeedFetcher can kill the task if it takes way too long.
    // https://developer.android.com/training/basics/network-ops/connecting.html
    private class FetchFeedsTask extends AsyncTask<String, String, String> {

        @Override
        protected String doInBackground(String... urls) {
            // params comes from the execute() call: params[0] is the url.
            String output;
            try {
                // First, call urlrss to initiate feedme:
                output = downloadUrl(urls[0]);
                publishProgress("\nStarted feedme!\n");
                publishProgress(output);

                // Figure out our feed directory based on the date:
                //String feeddir = mServerUrl + "/feeds/05-30-Sat/";
                Date curDate = new Date();
                SimpleDateFormat format = new SimpleDateFormat("MM-dd-EEE");
                String feeddir = mServerUrl + "/feeds/"
                    + format.format(curDate) + "/";

                // Now, we wait for LOG to appear, periodically checking
                // what's in the directory.
                int delay = 1000; // 10000;   // milliseconds
                Boolean feedmeRan = false;
                for (int i = 0; i < 5; ++i) {   // This should be while true
                    try {
                        Thread.sleep(delay);
                    } catch (InterruptedException e) {
                        // Throwing this error clears the interrupt bit,
                        // so in case we actually needed to be interrupted:
                        Thread.currentThread().interrupt();
                    }

                    output = downloadUrl(feeddir);
                    publishProgress("" + output.length() + " characters");
                    List<String> subdirs = HTMLDirToList(output);
                    String subdirStr = "subdirs now:";
                    for (String subdir : subdirs) {
                        if (subdir.equals("LOG")) {
                            publishProgress("feedme finished!");
                            feedmeRan = true;
                        }
                        subdirStr += " " + subdir;
                    }
                    publishProgress(subdirStr);
                    if (feedmeRan)
                        break;
                }

                // Now it's time to download!
                String manifest = downloadUrl(feeddir + "/MANIFEST");
                if (manifest.length() > 0) {
                    String[] filenames = manifest.split("\n+");
                    for (String f : filenames) {
                        String furl = feeddir + "/" + f;
                        String filepath = mLocalDir + "/" + f;
                        //publishProgress(f);
                        publishProgress("Saving " + furl);
                        publishProgress("  to " + filepath);
                        File fstat = new File(filepath);
                        if (! fstat.exists()) {
                            output = downloadUrl(furl);
                            FileOutputStream fos =
                                new FileOutputStream(new File(filepath),
                                                     false);
                            fos.write(output.getBytes());
                            fos.close();
                        }
                    }
                }

                return "Finished with FetchFeedsTask";

            } catch (IOException e) {
                return "Couldn't fetch " + urls[0];
            }
        }

        protected void onProgressUpdate(String... progress) {
            logProgress(progress[0]);
        }

        // onPostExecute displays the return value of the AsyncTask.
        @Override
        protected void onPostExecute(String message) {
            logProgress("\nDone with FeedFetcher!\n");
            logProgress(message);
            //logProgressOnUIThread(message);
        }
    }

    private List<String> HTMLDirToList(String html) {
        List<String> subdirs = new ArrayList<String>();

        String linkpat = "<a [^>]+>(.+?)</a>";
        Matcher matcher = Pattern.compile(linkpat,
                   Pattern.CASE_INSENSITIVE|Pattern.DOTALL).matcher(html);
        Boolean started = false;
        while (matcher.find()) {
            if (started)
                subdirs.add(matcher.group(1));
            if (matcher.group(1).equals("Parent Directory"))
                started = true;
        }
        return subdirs;
}

    private void logProgress(String s) {
        mFeedProgress.log(s + "\n");
    }

    private void logProgressOnUIThread(String s) {
        // Should append to the textview in the FeedViewer dialog.
        Log.d("FeedViewer:FeedFetcher", s);
        // The call inside runOnUiThread doesn't see s,
        // but it will see a new final string that's a copy of s:
        final String ss = "(subthread) " + s + "\n";
        ((Activity)mContext).runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mFeedProgress.log(ss);
                }
            });
    }

    // Given a URL, establishes an HttpUrlConnection and retrieves
    // the web page content as a InputStream, which it returns as
    // a string. Synchronous.
    private String downloadUrl(String myurl) throws IOException {
        InputStream is = null;
        logProgressOnUIThread("Trying to download " + myurl);
        
        try {
            URL url = new URL(myurl);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setReadTimeout(10000 /* milliseconds */);
            conn.setConnectTimeout(15000 /* milliseconds */);
            conn.setRequestMethod("GET");
            conn.setDoInput(true);
            // Starts the query
            conn.connect();
            int response = conn.getResponseCode();
            logProgressOnUIThread("Response code: " + response);
            is = conn.getInputStream();

            // Convert the InputStream into a string
            String contentAsString = readIt(is);
            return contentAsString;
        
            // Makes sure that the InputStream is closed after the app is
            // finished using it.
        } finally {
            if (is != null) {
                is.close();
            } 
        }
    }

    // Reads an InputStream and converts it to a String.
    // http://stackoverflow.com/a/5445161
    public String readIt(InputStream stream)
        throws IOException, UnsupportedEncodingException {
        java.util.Scanner s = new java.util.Scanner(stream).useDelimiter("\\A");
        return s.hasNext() ? s.next() : "";
        /*
        Reader reader = null;
        reader = new InputStreamReader(stream, "UTF-8");
        char[] buffer = new char[len];
        reader.read(buffer);
        return new String(buffer);
        */
    }
}
