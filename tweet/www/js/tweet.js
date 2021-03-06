// Javascript to let the user choose a bird name, match the name
// and play birdsong clips.
// Copyright 2014, 2016 by Akkana Peck.
// Share and enjoy under the GPL v2 or later.

// Android has this lovely habit of changing the way to access the SD card
// with every release. In KitKat it was /storage/extSdCard, but in Marshmallow
// it varies depending on the UUID of the card. So we have to search for it.
// We can't do that until onDeviceReady.

clipsloc = null;

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    //console.log(cordova.file);
    //clipsloc = "file:///storage/extSdCard/Android/data/com.shallowsky.WebClient/Tweet/Birdsongs/";
    //clipsloc = cordova.file.externalDataDirectory + "Birdsongs";
    clipsloc = cordova.file.externalRootDirectory + "Tweet";
    textfield = document.getElementById("nametext");
    textfield.value = "Hello, world";
    //alert("Looking in " + clipsloc);
    alert("app storage: " + cordova.file.externalApplicationStorageDirectory
          + ", data dir: " + cordova.file.externalDataDirectory);
}

// It would be nice to read the bird list off the filesystem,
// but we can't rely on Javascript being able to do that, so:
var bird_list = [
    "Aberts_Towhee,_.mp3",
    "Alder_Flycatcher,_Willow_Flycatcher.mp3",
    "Aleutian_Tern,_Black_Tern.mp3",
    "Altamira_Oriole,_Audubons_Oriole.mp3",
    "American_Bittern,_Least_Bittern.mp3",
    "American_Coot.mp3",
    "American_Crow,_Northwestern_Crow.mp3",
    "American_Dipper.mp3",
    "American_Golden-Plover,_Pacific_Golden-Plover.mp3",
    "American_Goldfinch.mp3",
    "American_Kestrel,_Merlin.mp3",
    "American_Tree_Sparrow,_Chipping_Sparrow.mp3",
    "American_White_Pelican,_Brown_Pelican.mp3",
    "Annas_n_Costas_Hummingbird.mp3",
    "Arctic_Loon,_Pacific_Loon.mp3",
    "Arctic_Warbler.mp3",
    "Bairds_Sandpiper,_Pectoral_Sandpiper.mp3",
    "Bald_Eagle.mp3",
    "Bar-Tailed_Godwit,_Marbled_Godwit.mp3",
    "Barn_Owl.mp3",
    "Barn_Swallow.mp3",
    "Barred_Owl.mp3",
    "Bewicks_Wren.mp3",
    "Black-Bellied_Plover.mp3",
    "Black-Bellied_Whistling_Duck.mp3",
    "Black-Billed_n_Yellow-Billed_Magpie.mp3",
    "Black-Capped_Chickadee.mp3",
    "Black-Capped_Gnatcatcher.mp3",
    "Black-Capped_n_Gray_Vireo.mp3",
    "Black-Headed_Grosbeak,_Blue_Grosbeak.mp3",
    "Black-Legged_Kittiwake,_Red-Legged_Kittiwake.mp3",
    "Black-Necked_Stilt,_American_Avocet.mp3",
    "Black-Tailed_Gnatcatcher.mp3",
    "Black-Throated_Gray_Warbler,_Golden-Cheeked_Warbler.mp3",
    "Black-Throated_Sparrow,_Sage_Sparrow.mp3",
    "Black-Vented_Shearwater.mp3",
    "Black_Guillemot,_Pigeon_Guillemot.mp3",
    "Black_Oystercatcher.mp3",
    "Black_Phoebe.mp3",
    "Black_Rail.mp3",
    "Black_Rosy-Finch.mp3",
    "Black_Skimmer.mp3",
    "Black_Storm-Petrel,_Least_Storm-Petrel.mp3",
    "Black_Swift,_Vauxs_Swift.mp3",
    "Blackpoll_Warbler,_American_Redstart.mp3",
    "Blue-Gray_Gnatcatcher.mp3",
    "Blue-Throated_n_Magnificent_Hummingbird.mp3",
    "Blue-Winged_Teal,_Cinnamon_Teal.mp3",
    "Blue_Grouse.mp3",
    "Bluethroat.mp3",
    "Bobolink.mp3",
    "Bohemian_Waxwing,_Cedar_Waxwing.mp3",
    "Boreal_Owl.mp3",
    "Boreal_n_Gray-Headed_Chickadee.mp3",
    "Botteris_Sparrow,_Rufous-Crowned_Sparrow.mp3",
    "Brambling.mp3",
    "Brandts_Cormorant.mp3",
    "Brewers_Sparrow,_Black-Chinned_Sparrow.mp3",
    "Bridled_Titmouse.mp3",
    "Broad-Billed_Hummingbird.mp3",
    "Bronzed_Cowbird,_Brown-Headed_Cowbird.mp3",
    "Brown-Capped_Rosy-Finch.mp3",
    "Brown-Crested_Flycatcher.mp3",
    "Brown_Creeper.mp3",
    "Buff-Bellied_n_Violet-Crowned_Hummingbird.mp3",
    "Buff-Breasted_Flycatcher.mp3",
    "Buff-Collared_Nightjar.mp3",
    "Bullers_Shearwater.mp3",
    "Bullocks_Oriole,_Scotts_Oriole.mp3",
    "Burrowing_Owl.mp3",
    "Bushtit.mp3",
    "Cactus_Wren.mp3",
    "California_Gnatcatcher.mp3",
    "California_Quail,_Gambels_Quail.mp3",
    "Calliope_n_Broad-Tailed_Hummingbird.mp3",
    "Canada_Goose,_Brant.mp3",
    "Canvasback,_Redhead.mp3",
    "Canyon_Towhee,_California_Towhee.mp3",
    "Carolina_Wren.mp3",
    "Cassins_Auklet.mp3",
    "Cassins_Finch.mp3",
    "Cassins_n_Thick-Billed_Kingbird.mp3",
    "Chestnut-Collared_Longspur.mp3",
    "Chihuahuan_Raven,_Common_Raven.mp3",
    "Chukar.mp3",
    "Clapper_Rail.mp3",
    "Clarks_Nutcracker.mp3",
    "Clay-Colored_Robin,_American_Robin.mp3",
    "Cliff_n_Cave_Swallow.mp3",
    "Common_Black_Hawk,_Harriss_Hawk.mp3",
    "Common_Goldeneye,_Barrows_Goldeneye.mp3",
    "Common_Ground-Dove,_Ruddy_Ground-Dove.mp3",
    "Common_Loon,_Yellow-Billed_Loon.mp3",
    "Common_Moorhen.mp3",
    "Common_Murre,_Thick-Billed_Murre.mp3",
    "Common_Nighthawk.mp3",
    "Common_Pauraque.mp3",
    "Common_Poorwill.mp3",
    "Common_Redpoll.mp3",
    "Common_Ringed_Plover,_Semipalmated_Plover.mp3",
    "Common_Snipe,_Wilsons_Phalarope.mp3",
    "Common_Tern,_Arctic_Tern.mp3",
    "Common_Yellowthroat.mp3",
    "Coopers_Hawk,_Northern_Goshawk.mp3",
    "Crested_Caracara.mp3",
    "Crissal_Thrasher,_Le_Contes_Thrasher.mp3",
    "Curve-Billed_Thrasher,_California_Thrasher.mp3",
    "Dark-Eyed_Junco,_Yellow-Eyed_Junco.mp3",
    "Dovekie.mp3",
    "Downy_n_Hairy_Woodpecker.mp3",
    "Dusky-Capped_n_Ash-Throated_Flycatcher.mp3",
    "Eastern_Bluebird,_Western_Bluebird.mp3",
    "Eastern_Meadowlark,_Western_Meadowlark.mp3",
    "Elegant_Trogon,_Eared_Trogon.mp3",
    "Elf_Owl.mp3",
    "Eurasian_Widgeon,_American_Widgeon.mp3",
    "European_Starling.mp3",
    "Ferruginous_Hawk,_Rough-Legged_Hawk.mp3",
    "Five-Striped_Sparrow.mp3",
    "Flammulated_Owl.mp3",
    "Fork-Tailed_Storm-Petrel.mp3",
    "Forsters_Tern,_Least_Tern.mp3",
    "Fox_Sparrow.mp3",
    "Franklins_Gull,_Bonapartes_Gull.mp3",
    "Gila_n_Golden-Fronted_Woodpecker.mp3",
    "Glaucous-Winged_Gull,_Glaucous_Gull.mp3",
    "Golden-Crowned_Kinglet.mp3",
    "Golden_Eagle.mp3",
    "Graces_Warbler.mp3",
    "Gray-Crowned_Rosy-Finch.mp3",
    "Gray_Catbird.mp3",
    "Gray_Flycatcher,_Dusky_Flycatcher.mp3",
    "Gray_Hawk.mp3",
    "Gray_Jay.mp3",
    "Gray_Partridge,_Ring-Necked_Pheasant.mp3",
    "Great-Tailed_Grackle.mp3",
    "Great_Blue_Heron,_Great_Egret.mp3",
    "Great_Gray_Owl.mp3",
    "Great_Horned_Owl.mp3",
    "Great_Kiskadee.mp3",
    "Greater_Pewee.mp3",
    "Greater_Roadrunner.mp3",
    "Greater_Scaup,_Lesser_Scaup.mp3",
    "Greater_White-Fronted_&_Emperor_Goose.mp3",
    "Greater_Yellowlegs,_Lesser_Yellowlegs.mp3",
    "Green-Tailed_Towhee.mp3",
    "Green-Winged_Teal.mp3",
    "Green_Heron,_Black-Crowned_Night_Heron.mp3",
    "Green_Jay,_Brown_Jay.mp3",
    "Green_Kingfisher.mp3",
    "Green_Parakeet.mp3",
    "Groove-Billed_Ani.mp3",
    "Gull-Billed_Tern,_Caspian_Tern.mp3",
    "Gyrfalcon.mp3",
    "Harlequin_Duck,_Surf_Scoter.mp3",
    "Heermanns_Gull,_Mew_Gull.mp3",
    "Hepatic_Tanager,_Summer_Tanager.mp3",
    "Hermit_Thrush.mp3",
    "Herring_Gull,_Thayers_Gull.mp3",
    "Himalayan_Snowcock.mp3",
    "Hoary_Redpoll.mp3",
    "Hooded_Merganser,_Common_Merganser.mp3",
    "Hooded_Oriole.mp3",
    "Horned_Lark.mp3",
    "Horned_Puffin.mp3",
    "House_Finch.mp3",
    "House_Sparrow.mp3",
    "House_Wren.mp3",
    "Huttons_n_Warbling_Vireo.mp3",
    "Inca_Dove.mp3",
    "Introduction.mp3",
    "Island_Scrub_Jay,_Western_Scrub_Jay.mp3",
    "Killdeer.mp3",
    "King_Eider,_Common_Eider.mp3",
    "Ladder-Backed_n_Nuttalls_Woodpecker.mp3",
    "Laughing_Gull.mp3",
    "Lawrences_Goldfinch.mp3",
    "Laysan_Albatross,_Black-Footed_Albatross.mp3",
    "Lazuli_Bunting,_Indigo_Bunting.mp3",
    "Leachs_Storm-Petrel,_Ashy_Storm-Petrel.mp3",
    "Least_Flycatcher,_Hammonds_Flycatcher.mp3",
    "Least_Grebe.mp3",
    "Least_Sandpiper,_White-Rumped_Sandpiper.mp3",
    "Lesser_Goldfinch.mp3",
    "Lesser_Nighthawk.mp3",
    "Lewiss_n_Acorn_Woodpecker.mp3",
    "Lincolns_Sparrow,_Harriss_Sparrow.mp3",
    "Loggerhead_n_Northern_Shrike.mp3",
    "Long-Billed_Curlew,_Hudsonian_Godwit.mp3",
    "Long-Billed_Thrasher,_Bendires_Thrasher.mp3",
    "Long-Eared_Owl.mp3",
    "Lucifer_n_Black-Chinned_Hummingbird.mp3",
    "Lucys_Warbler,_Tropical_Parula.mp3",
    "Mallard,_Mottled_Duck.mp3",
    "Marbled_Murrelet,_Kittlitzs_Murrelet.mp3",
    "Marsh_Wren.mp3",
    "McCowns_Longspur,_Lapland_Longspur.mp3",
    "Mexican_Jay,_Pinyon_Jay.mp3",
    "Mexican_n_Chestnut-Backed_Chickadee.mp3",
    "Mongolian_Plover,_Snowy_Plover.mp3",
    "Mountain_Bluebird.mp3",
    "Mountain_Chickadee.mp3",
    "Mountain_Quail,_Scaled_Quail.mp3",
    "Neotropic_Cormorant,_Double-Crested_Cormorant.mp3",
    "Northern_Beardless_Tyrannulet.mp3",
    "Northern_Bobwhite,_Montezuma_Quail.mp3",
    "Northern_Cardinal,_Pyrrhuloxia.mp3",
    "Northern_Fulmar,_Mottled_Petrel.mp3",
    "Northern_Harrier.mp3",
    "Northern_Mockingbird,_Sage_Thrasher.mp3",
    "Northern_Pygmy-Owl,_Ferruginous_Pygmy-Owl.mp3",
    "Northern_Rough-Winged_n_Bank_Swallow.mp3",
    "Northern_Saw-Whet_Owl.mp3",
    "Northern_Shoveler,_Northern_Pintail.mp3",
    "Northern_Waterthrush,_MacGillivrays_Warbler.mp3",
    "Northern_Wheatear.mp3",
    "Northern_n_Gilded_Flicker.mp3",
    "Oak_n_Juniper_Titmouse.mp3",
    "Oldsquaw,_Bufflehead.mp3",
    "Olive-Sided_Flycatcher.mp3",
    "Olive_Warbler.mp3",
    "Orange-Crowned_Warbler,_Nashville_Warbler.mp3",
    "Osprey,_Hook-Billed_Kite.mp3",
    "Pacific-Lope_n_Cordilleran_Flycatcher.mp3",
    "Painted_Redstart,_Golden-Crowned_Warbler.mp3",
    "Parakeet_Auklet,_Least_Auklet_.mp3",
    "Parasitic_Jaeger,_Long-Tailed_Jaeger.mp3",
    "Peregrine_Falcon,_Praire_Falcon.mp3",
    "Phainopepla.mp3",
    "Pied-Billed_Grebe,_Horned_Grebe.mp3",
    "Pileated_Woodpecker.mp3",
    "Pine_Grosbeak.mp3",
    "Pine_Siskin.mp3",
    "Pink-Footed_Shearwater,_Fresh-Footed_Shearwater.mp3",
    "Plain_Chachalaca.mp3",
    "Plumbeous_n_Cassns_Vireo.mp3",
    "Pomarine_Jaeger.mp3",
    "Purple_Finch.mp3",
    "Purple_Martin.mp3",
    "Red-Billed_Pigeon,_Band-Tailed_Pigeon.mp3",
    "Red-Breasted_Merganser,_Ruddy_Duck.mp3",
    "Red-Breasted_Nuthatch.mp3",
    "Red-Eyed_n_Yellow-Green_Vireo.mp3",
    "Red-Faced_Cormorant,_Pelagic_Cormorant.mp3",
    "Red-Naped_n_Red-Breasted_Sapsucker.mp3",
    "Red-Necked_Grebe,_Eared_Grebe.mp3",
    "Red-Necked_Phalarope,_Red_Phalarope.mp3",
    "Red-Necked_Stint,_Temmincks_Stint.mp3",
    "Red-Shouldered_Hawk,_Swainsons_Hawk.mp3",
    "Red-Tailed_Hawk.mp3",
    "Red-Throated_Loon.mp3",
    "Red-Throated_Pipit,_American_Pipit.mp3",
    "Red-Winged_Blackbird,_Tricolored_Blackbird.mp3",
    "Red_Crossbill.mp3",
    "Red_Knot,_Sanderling.mp3",
    "Rhinoceros_Auklet.mp3",
    "Ring-Billed_Gull,_California_Gull.mp3",
    "Ring-Necked_Duck,_Tufted_Duck.mp3",
    "Ringed_n_Belted_Kingfisher.mp3",
    "Rock_Dove.mp3",
    "Rock_Sandpiper,_Dunlin.mp3",
    "Rock_n_Canyon_Wren.mp3",
    "Rose-Throated_Becard.mp3",
    "Rosss_Gull,_Ivory_Gull.mp3",
    "Royal_Tern,_Elegant_Tern.mp3",
    "Ruby-Crowned_Kinglet.mp3",
    "Ruddy_Turnstone,_Black_Turnstone.mp3",
    "Ruffed_Grouse.mp3",
    "Rufous-Winged_Sparrow,_Cassins_Sparrow.mp3",
    "Rufous_n_Allens_Hummingbird.mp3",
    "Rusty_Blackbird,_Brewers_Blackbird.mp3",
    "Sage_Grouse,_Spruce_Grouse.mp3",
    "Sandhill_Crane.mp3",
    "Savannah_Sparrow,_Grasshopper_Sparrow.mp3",
    "Says_Phoebe.mp3",
    "Scissor-Tailed_Flycatcher.mp3",
    "Semipalmated_Sandpiper,_Semipalmated_Sandpiper.mp3",
    "Sharp-Shinned_Hawk.mp3",
    "Sharp-Tailed_Grouse.mp3",
    "Short-Billed_Dowitcher,_Long-Billed_Dowitcher.mp3",
    "Short-Eared_Owl.mp3",
    "Siberian_Rubythroat.mp3",
    "Sky_Lark.mp3",
    "Smiths_Longspur.mp3",
    "Snow_Bunting.mp3",
    "Snow_Goose,_Rosss_Goose.mp3",
    "Snowy_Egret,_Cattle_Egret.mp3",
    "Snowy_Owl,_Northern_Hawk_Owl.mp3",
    "Solitary_Sandpiper,_Willet.mp3",
    "Song_Sparrow.mp3",
    "Sooty_Shearwater,_Short-Tailed_Shearwater.mp3",
    "Sora.mp3",
    "South_Polar_Skua.mp3",
    "Spotted_Dove.mp3",
    "Spotted_Owl.mp3",
    "Spotted_Sandpiper,_Upland_Sandpiper.mp3",
    "Spotted_Towhee.mp3",
    "Stellers_Eider,_Spectacled_Eider.mp3",
    "Stellers_Jay.mp3",
    "Stilt_Sandpiper,_Buff-Breasted_Sandpiper.mp3",
    "Stricklands_n_White-Headed_Woodpecker.mp3",
    "Sulphur-Bellied_Flycatcher.mp3",
    "Surfbird.mp3",
    "Swainsons_Thrush.mp3",
    "Tamaulipas_Crow.mp3",
    "Thick-Billed_Parrot,_Red-Crowned_Parrot.mp3",
    "Three-Toed_n_Black-Backed_Woodpecker.mp3",
    "Townsends_Solitaire.mp3",
    "Townsends_Warbler,_Hermit_Warbler.mp3",
    "Tree_Swallow,_Violet-Green_Swallow.mp3",
    "Tropical_n_Couchs_Kingbird.mp3",
    "Trumpeter_Swan,_Tundra_Swan.mp3",
    "Tufted_Puffin.mp3",
    "Tufted_Titmouse.mp3",
    "Turkey_Vulture,_California_Condor.mp3",
    "Varied_Bunting,_Painted_Bunting.mp3",
    "Varied_Thrush.mp3",
    "Veery,_Gray-Cheeked_Thrush.mp3",
    "Verdin.mp3",
    "Vermilion_Flycatcher.mp3",
    "Vesper_Sparrow,_Lark_Sparrow.mp3",
    "Virginia_Rail.mp3",
    "Virginias_Warbler,_Colima_Warbler.mp3",
    "Wandering_Tattler.mp3",
    "Western_Grebe,_Clarks_Grebe.mp3",
    "Western_Screech-Owl,_Whiskered_Screech-Owl.mp3",
    "Western_Tanager.mp3",
    "Western_Wood_Pewee.mp3",
    "Western_n_Eastern_Kingbird.mp3",
    "Whimbrel,_Bristle-Thighed_Curlew.mp3",
    "Whip-Poor-Will.mp3",
    "Whiskered_Auklet.mp3",
    "White-Breasted_n_Pygmy_Nuthatch.mp3",
    "White-Collared_Seedeater,_Olive_Sparrow.mp3",
    "White-Crowned_Sparrow,_Golden-Crowned_Sparrow.mp3",
    "White-Eyed_n_Bells_Vireo.mp3",
    "White-Faced_Ibis.mp3",
    "White-Tailed_Hawk,_Zone-Tailed_Hawk.mp3",
    "White-Tailed_Kite,_Mississippi_Kite.mp3",
    "White-Tailed_Ptarmigan.mp3",
    "White-Throated_Swift.mp3",
    "White-Tipped_Dove.mp3",
    "White-Winged_Crossbill.mp3",
    "White-Winged_Dove,_Mourning_Dove.mp3",
    "White-Winged_Scoter,_Black_Scoter.mp3",
    "Wild_Turkey.mp3",
    "Williamsons_Sapsucker.mp3",
    "Willow_Ptarmigan,_Rock_Ptarmigan.mp3",
    "Wilsons_Warbler,_Red-Faced_Warbler.mp3",
    "Winter_Wren.mp3",
    "Wood_Duck,_Gadwall.mp3",
    "Wrentit.mp3",
    "Xantuss_Murrelet,_Ancient_Murrelet.mp3",
    "Yellow-Billed_Cuckoo.mp3",
    "Yellow-Breasted_Chat.mp3",
    "Yellow-Footed_Gull,_Western_Gull.mp3",
    "Yellow-Headed_Blackbird.mp3",
    "Yellow_Rail.mp3",
    "Yellow_Wagtail,_White_Wagtail.mp3",
    "Yellow_Warbler,_Yellow-Rumped_Warbler.mp3",
  ];

  var lastname = "";
function findBird(birdname) {
    // We can only call this onKeyUp, not onChange -- onChange only fires
    // on focus changes (so what's the difference between it and onBlur?).
    // So to prevent firing on things like Enter or Shift, check to see
    // if the value has really changed.
    if (lastname == birdname)
      return;
    lastname = birdname;
    birdname = birdname.toLowerCase();
    matchlist = document.getElementById("matchlist");
    matchlist.innerHTML = "<ul></ul>";    // clear the list
    if (! birdname) return;
    for (var i in bird_list) {
      var bird = bird_list[i];
      if (bird.toLowerCase().indexOf(birdname) >= 0) {
        //alert("matched " + bird);
        var item = document.createElement("li");
        matchlist.appendChild(item);
        var link = document.createElement("a");
        link.setAttribute('href', clipsloc + bird);
        // strip extension:
        var dot = bird.lastIndexOf('.');
        if (dot > 0) bird = bird.substring(0, dot);
        // might also want to substitute spaces for underscores
        var birdtxt = document.createTextNode(bird);
        link.appendChild(birdtxt);
        item.appendChild(link);
    }
  }
}
function search() {
    textfield = document.getElementById("nametext");
    alert(textfield.value);
    findBird(textfield.value);
}

function letter(c) {
    textfield = document.getElementById("nametext");
    val = textfield.value;
    val += c;
    textfield.value = val;
    findBird(val);
}
function clearall() {
    textfield = document.getElementById("nametext");
    textfield.value = "";
    findBird("");
}
function backspace() {
    textfield = document.getElementById("nametext");
    val = textfield.value;
    len = val.length;
    textfield.value = val.slice(0, len-1);
    findBird(val);
}

/*
function doload() {
      alert("Loaded");
      matchlist = document.getElementById("matchlist");
      if (matchlist)
          matchlist.innerHTML = "Loaded";
      textfield = document.getElementById("nametext");
      textfield.value = "hello, world";
}
*/
