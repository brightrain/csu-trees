var csut = {
    config: {
        mapServiceUrl: "http://centroid1.acns.colostate.edu:6080/arcgis/rest/services/Trees/CSU_Trees_2013_webmerc/MapServer/",
        arcgisGeocodingBaseUrl: "http://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/",
        arcgisGeometryServiceUrl: "http://tasks.arcgisonline.com/ArcGIS/rest/services/Geometry/GeometryServer/",
        layerIndexes: {
            treesLayerIndex: 0
        },
        treeSymbolPath: "img/tree.png",
        selectedFeatureStyle: {
            color: "#F5D04C",
            weight: 15
        },
        csuLibraryBounds: [
            [40.575, -105.082],
            [40.573, -105.088]
        ],
        csuHughesBounds: [
            [40.5633, -105.1390],
            [40.5609, -105.1433]
        ],
        informationContent: "This is the story about how we collected this data and what this application does with it."
    }
};