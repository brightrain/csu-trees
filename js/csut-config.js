var csut = {
    config: {
        //mapServiceUrl: "http://centroid1.acns.colostate.edu:6080/arcgis/rest/services/Trees/CSU_Trees_2013_webmerc/MapServer/",
        mapServiceUrl: "https://services1.arcgis.com/KNdRU5cN6ENqCTjk/arcgis/rest/services/csu_trees/FeatureServer/",
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
        csuOvalBounds: [
            [40.579, -105.08],
            [40.571, -105.1]
        ],
        csuHughesBounds: [
            [40.5642, -105.1340],
            [40.5596, -105.1433]
        ],
        csuFoothillsBounds: [
            [40.5893, -105.13],
            [40.5737, -105.1586]
        ],
        informationContent: "" +
                            "<h3>This project, supported by a Warner College Mini-Grant, was developed through a partnership between CSU Facilities Management " +
                            "and the Geospatial Centroid at CSU. The points shown here represent all of the trees on the campus of Colorado State University.</h3>"
    }
};