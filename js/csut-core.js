/* globals $, L */

$.extend(true, csut, {
    config: {},
    treesLayer: {},
    icons: {
        deciduousTreeIcon: {},
        coniferousTreeIcon: {}
    },
    map: {},
    mapMarker: {},
    searchMarker: {},
    current: {
        selectedGeoJson: null
    },
    _handlebars: function(str, obj) {
        for (var prop in obj) {
            str = str.replace(new RegExp("{{" + prop + "}}", "g"), obj[prop]);
        }

        return str;
    },
    buildTreeContent: function(feature) {
            var properties = feature.properties,
            content = "";
        if(properties.DecidConif === "D") {
            content += "<img scr='~./img/csut-icon-tree-deciduous.png'>";
        }
        else {
            content += "<img scr='~./img/csut-icon-tree-conifer.png'>";
        } 
        content += "<h2>" + properties.New_Common + "</h2>" +
        "<h5>" + properties.Genus_spec + "</h5>" +
        "<h5>" + properties.Family + "</h5>";
        return content;
    },
    findAndZoom: function(findThis) {
        $.getJSON(csut.config.arcgisGeocodingBaseUrl + "find?f=json&text=" + findThis + "&callback=?", function (results) {
            try {
                if (results && results.locations && results.locations.length > 0) {
                    var result = results.locations[0],
                        ll = L.latLng(result.feature.geometry.y, result.feature.geometry.x);
                    //ToDo: get full list of address types returned
                    switch(result.feature.attributes.Addr_Type) {
                        case "POI":
                            zoomLevel = 12;
                            break;
                        case "StreetName":
                            zoomLevel = 14;
                            break;
                        case "StreetAddress":
                            zoomLevel = 16;
                            break;
                        case "PointAddress":
                            zoomLevel = 18;
                            break;
                    }

                    csut.searchMarker.setLatLng(ll);
                    csut.map.setView(ll, 12).addLayer(csut.searchMarker);
                } else {
                    csut.notify($("#search-box"), "No results found for " + findThis);
                }
            } catch (e) {
                csut.notify($("#search-box"), "Unable to execute search at this time");
            }
        });
    },
    init: function() {
        try {
            $("#csut-tabs a").click(function (e) {
                e.preventDefault();
                $(this).tab('show');
            });
            $(".csut-tip").tooltip();
            // hide sidebar by default
            $("#sidebar-content").hide();
            $("#map").addClass("expanded-map");
            $("#toggle-side-panel").click(function() {
                if($("#sidebar-content").is(":visible")) {
                    $("#sidebar-content").hide();
                    $("#map").addClass("expanded-map");
                    $("#csut-toggle-side-panel-icon").removeClass("csut-icon-collapse").addClass("csut-icon-expand");
                }
                else {
                    $("#sidebar-content").show();
                    $("#map").removeClass("expanded-map");
                    $("#csut-toggle-side-panel-icon").removeClass("csut-icon-collapse").addClass("csut-icon-collapse");
                }
                csut.map.invalidateSize();
            });
            $("#csut-information").html(csut.config.informationContent);
            $("#info-btn").click(function() {
                $("#info-modal").modal("show");
                $(".navbar-collapse.in").collapse("hide");
                return false;
            });
           
            this.map = L.map('map',
                             {
                zoomControl: false
            }).fitBounds(csut.config.csuCampusBounds);
            new L.Control.Zoom({ position: 'bottomleft' }).addTo(csut.map);
            //https://github.com/MrMufflon/Leaflet.Coordinates
            L.control.coordinates({
                position:"topleft",
                decimals:4,
                decimalSeperator:".",
                labelTemplateLat:"Y: {y}",
                labelTemplateLng:"X: {x}",
                enableUserInput:false,
                useDMS:false,
                useLatLngOrder: false
            }).addTo(this.map);
            csut.basemapLayer = L.esri.basemapLayer("Topographic").addTo(this.map);
            $("#toggle-topo-basemap").click(function () {
                $(this).removeClass("inactive").addClass("active");
                $("#toggle-aerial-basemap").removeClass("active").addClass("inactive");
                csut.setBasemap("Topographic");
            });
            $("#toggle-aerial-basemap").click(function () {
                $(this).removeClass("inactive").addClass("active");
                $("#toggle-topo-basemap").removeClass("active").addClass("inactive");
                csut.setBasemap("Imagery");
            });
            csut.current.selectedGeoJson = new L.GeoJSON(null, {
                style: function () {
                    return csut.config.selectedFeatureStyle;
                }
            }).addTo(csut.map);
            /**/
            csut.csutDynamicLayer = L.esri.dynamicMapLayer({
                url: csut.config.mapServiceUrl,
                opacity : 1
            }).addTo(this.map);
            
            /* Add trees layer as feature layer so we can change icons and interact with them*/
            csut.treesLayer = L.esri.featureLayer({
                url: csut.config.mapServiceUrl + csut.config.layerIndexes.treesLayerIndex,
                pointToLayer: function (geojson, latlng) {
                    var icon = null;
                    
                    if(geojson.properties.DecidConif === "D") {
                        icon = csut.icons.deciduousTreeIcon; 
                    }
                    else {
                        icon = csut.icons.coniferousTreeIcon; 
                    }
                    return L.marker(latlng, {
                        icon: icon
                    });
                }
            })
                .bindPopup(function(feature){
                return csut.buildTreeContent(feature);
            }).addTo(this.map);
            /*
            this.map.on("click", function(e) {
                try {
                    $("#info-pane").addClass("csut-loading")
                        .html("");
                    //expand side panel if collapsed
                    if($("#sidebar-content").is(":visible") === false) {
                        $("#sidebar-content").show();
                        $("#map").removeClass("expanded-map");
                        $("#csut-toggle-side-panel-icon").removeClass("csut-icon-expand").addClass("csut-icon-collapse");
                        csut.map.invalidateSize();
                    }

                } catch(err) {
                    $("#info-pane").removeClass("csut-loading");
                    //console.log(err.message);
                }
                finally {
                    $('#csut-tabs a[href="#info-pane"]').tab('show');
                }
            });
            */
            csut.searchMarker = L.circleMarker(new L.LatLng(0, 0), { color: 'red' });
            csut.mapMarker = L.circleMarker(new L.LatLng(0, 0), { color: 'yellow', opacity: 0.9, fillOpacity:0.7 });
            $("#search-btn").click(function () {
                if ($("#search-box").val() !== "") {
                    csut.findAndZoom($("#search-box").val());
                }
                else {
                    csut.notify($("#search-box"), "No search term entered"); 
                }
            }); 
            /* Highlight search box text on click */
            $("#search-box").click(function () {
                $(this).select();
            });
            /*< using typeahead js >*/
            
            var esriBH = new Bloodhound({
                name: "Esri",
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                remote: {
                    //https://developers.arcgis.com/rest/geocode/api-reference/geocoding-suggest.htm
                    //use the searchExtent parameter to limit to US
                    url: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?text=%QUERY" + 
                    "&searchExtent=-165,71.3,-58.4,14.8&f=json",
                    filter: function (data) {
                        return $.map(data.suggestions, function (result) {
                            //typically this is a category or type of business (e.g. coffee shops)
                            if(result.isCollection === false) {
                                return {
                                    name: result.text,
                                    magicKey: result.magicKey,
                                    source: "Esri"
                                };
                            }
                        });
                    },
                    //dataType needs to be jsonp to support < IE 10
                    ajax: {
                        dataType: "jsonp"
                    }
                },
                limit: 12
            });
            esriBH.initialize();

            $("#search-box").typeahead({
                minLength: 3,
                highlight: true,
                hint: false
            },
            {
                name: "Esri",
                displayKey: "name",
                source: esriBH.ttAdapter(),
                templates: {
                    header: "<h4 class='typeahead-header'><img src='img/csut-icon-search-results.png'>&nbsp;Addresses and Places</h4>"  
                }
            }).on("typeahead:selected", function (obj, datum) {
                var url = "";
                if(datum.source == "Esri") {
                    //!!!Important: need  to append callback=? to the url to support jsonp
                    //which is required to support < IE 10
                    url = csut.config.arcgisGeocodingBaseUrl + "find?" +
                        "magicKey=" + datum.magicKey + "&text=" + datum.name + 
                        "&outFields=Addr_type&f=json&callback=?";
                    //https://developers.arcgis.com/rest/geocode/api-reference/geocoding-find.htm
                    //make the call to the geocode service to get the result
                    $.getJSON(url, function(result) {
                        if(result.locations.length > 0) {
                            var extent = result.locations[0].extent;
                            var bounds = L.latLngBounds([[extent.ymin, extent.xmin], [extent.ymax, extent.xmax]]);
                            //https://developers.arcgis.com/rest/geocode/api-reference/geocoding-service-output.htm
                            var type = result.locations[0].feature.attributes.Addr_type;
                            if(type === "PointAddress" || 
                               type === "BuildingName" || 
                               type === "StreetAddress" || 
                               type === "StreetInt" || 
                               type === "StreetName") {
                                var ll = L.latLng(result.locations[0].feature.geometry.y, result.locations[0].feature.geometry.x);
                                csut.searchMarker.setLatLng(ll);
                                csut.map.addLayer(csut.searchMarker)
                                    .fitBounds(bounds, {maxZoom: 18});
                            }
                            else {
                                csut.map.fitBounds(bounds);
                            }
                        }
                        else {
                            csut.notify($("#search-box"), "Could not go to" + datum.name);
                        }
                    });
                }
            });
            /*</ using typeahead js />*/

            /*<layer toggles>*/
            $("#legend-trees-layer").click(function() {
                $(this).toggleClass("visible");
                csut.updateLegendItemUI($(this));
                if(csut.map.hasLayer(csut.facilitiesLayer)) {
                    csut.map.removeLayer(csut.facilitiesLayer);
                }else {
                    if($(this).hasClass("out-of-visibility-range") === false) {
                        csut.map.addLayer(csut.facilitiesLayer);
                    }  
                }
            });
            
            /*</layer toggles>*/
            this.icons.coniferousTreeIcon = L.icon({
                iconUrl: '/img/csut-icon-tree-conifer-small.png',
                //iconRetinaUrl: 'img/csut-icon-tree-conifer-small.png',
                //use native icon size
                //iconSize: [50, 50],
                iconAnchor: [11, 20],
                popupAnchor: [-4, -25]
            });

            this.icons.deciduousTreeIcon = L.icon({
                iconUrl: '/img/csut-icon-tree-deciduous-small.png',
                //iconRetinaUrl: '/img/csut-icon-tree-deciduous-small.png',
                //use native icon size
                //iconSize: [50, 50],
                iconAnchor: [11, 20],
                popupAnchor: [-4, -25]
            });

            //Hide the div that we display while loading the page.
            $("#preloader").hide();

            return true;
        }
        catch(err)
        {
            //console.log(err.message);
            return false;
        }
    },
    notify: function(target, message) {
        target.tooltip({
            title: message,
            trigger: "manual"
        });
        target.tooltip("show");
        window.setTimeout(function() {
            target.tooltip("destroy");
        }, 3000);
    },
    setBasemap: function(basemap) {
        if (csut.basemapLayer) {
            csut.map.removeLayer(csut.basemapLayer);
        }

        csut.basemapLayer = L.esri.basemapLayer(basemap);
        csut.map.addLayer(csut.basemapLayer);

        if (csut.basemapLayerLabels) {
            csut.map.removeLayer(csut.basemapLayerLabels);
        }

        if (basemap === 'Imagery') {
            //could also use these but man they're ugly
            //csut.basemapLayerLabels = L.esri.basemapLayer('ImageryLabels');
            csut.basemapLayerLabels = L.esri.basemapLayer('GrayLabels');
            csut.map.addLayer(csut.basemapLayerLabels);
        }
    }
});