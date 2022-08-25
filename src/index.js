require("./index.css");
require("cesium/Widgets/widgets.css");

document.body.onload = () => {
  const trainPath = require("./train-path.js");
  const trainImage = require("./train.png");
  const Cesium = require("cesium/Cesium");

  const wrapperId = "cesiumContainer";
  const terrainCesiumAssetId = 770371;
  const orthoImageUrl =
    "https://gic-plateau.s3.ap-northeast-1.amazonaws.com/2020/ortho/tiles/{z}/{x}/{y}.png";
  const yokohamCesiumAssetId = 1279936;
  const sagamiCesiumAssetId = 1280007;
  const totalMinute = 36;
  const totalSecond = 60.0 * totalMinute;
  const myCesiumAccessToken = process.env.MY_CESIUM_ACCESS_TOKEN;
  const plateauCesiumAccessToken = process.env.PLATEAU_CESIUM_ACCESS_TOKEN;

  // Use plateau cesium assets
  Cesium.Ion.defaultAccessToken = plateauCesiumAccessToken;

  // Create viewer with terrain
  const viewer = new Cesium.Viewer(wrapperId, {
    terrainProvider: new Cesium.CesiumTerrainProvider({
      url: Cesium.IonResource.fromAssetId(terrainCesiumAssetId),
    }),
  });

  // Add ortho to viewer
  const imageProvider = new Cesium.UrlTemplateImageryProvider({
    url: orthoImageUrl,
    maximumLevel: 19,
  });
  viewer.scene.imageryLayers.addImageryProvider(imageProvider);

  // Use my cesium assets
  Cesium.Ion.defaultAccessToken = myCesiumAccessToken;

  // Add Yokohama 3D tiles to viewer
  const yokohamaTileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(yokohamCesiumAssetId),
    })
  );

  // Add Sagamihara 3D tiles to viewer
  const sagamiTileset = viewer.scene.primitives.add(
    new Cesium.Cesium3DTileset({
      url: Cesium.IonResource.fromAssetId(sagamiCesiumAssetId),
    })
  );

  // Change 3d tile color
  const tileStyle = new Cesium.Cesium3DTileStyle({
    color: "color('#FFFFFF', 0.5)",
    show: true,
  });
  yokohamaTileset.style = tileStyle;
  sagamiTileset.style = tileStyle;

  // Add train animation to viewer
  const czml = [
    {
      id: "document",
      name: "Sotetsu Line",
      version: "1.0",
      clock: {
        interval: `2022-08-25T12:00:00Z/2022-08-25T12:${totalMinute}:00Z`,
        currentTime: "2022-08-25T12:00:00Z",
      },
    },
    {
      id: "dynamicBillboard",
      name: "train path",
      availability: `2022-08-25T12:00:00Z/2022-08-25T12:${totalMinute}:00Z`,
      position: {
        epoch: "2022-08-25T12:00:00Z",
        cartographicDegrees: trainPath
          .map((x) => [totalSecond * x[0], x[1], x[2], 10])
          .flat(),
        referenceFrame: "FIXED",
      },
      billboard: {
        image: {
          uri: trainImage,
          interval: `2022-08-25T12:00:00Z/2022-08-25T12:${totalMinute}:00Z`,
        },
        heightReference: "RELATIVE_TO_GROUND",
        scale: 0.2,
      },
    },
  ];
  const dataSourcePromise = Cesium.CzmlDataSource.load(czml, {});
  viewer.dataSources.add(dataSourcePromise);

  // Set camera position
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      trainPath[0][1],
      trainPath[0][2],
      1000.0
    ),
  });
};
