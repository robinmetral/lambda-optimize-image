const AWS = require("aws-sdk");
const async = require("async");
const sharp = require("sharp");
const exifReader = require("exif-reader");

const { generateFileName, getFileType, isValidFileType } = require("./helpers");

const MAX_WIDTH = 1920;

exports.handler = event => {
  const s3 = new AWS.S3();
  // get source from event
  const sourceBucket = event.Records[0].s3.bucket.name;
  const sourceKey = event.Records[0].s3.object.key;
  // define destination
  const destinationBucket = `${sourceBucket}-public`;

  async.waterfall(
    [
      function download(next) {
        console.log(`Downloading ${sourceKey} from ${sourceBucket}`);
        s3.getObject(
          {
            Bucket: sourceBucket,
            Key: sourceKey
          },
          next
        );
      },
      function optimize(response, next) {
        const image = sharp(response.Body);
        image.metadata().then(metadata => {
          // parse metadata to get image info
          const width = metadata.width < MAX_WIDTH ? metadata.width : MAX_WIDTH;
          // TODO handle vertical images
          console.log(`${sourceKey} will be resized to ${width}px width`);
          const exif = exifReader(metadata.exif);
          const date = new Date(
            exif.exif.DateTimeOriginal || exif.image.DateTimeOriginal
          );
          /*
          TODO check if valid file type and infer file extension
          const fileType = getFileType(image);
          const isValid = isValidFileType(fileType)
          */
          const fileName = `${generateFileName(date)}.jpg`;
          console.log(`${sourceKey} will be saved as ${fileName}`);
          // optimize image
          image
            .rotate() // rotate according to exif metadata
            .resize(width)
            .toBuffer()
            .then(optimized => {
              next(null, fileName, optimized);
            });
        });
      },
      function upload(fileName, optimized, next) {
        console.log(`Uploading ${fileName} to ${destinationBucket}`);
        s3.putObject(
          {
            Bucket: destinationBucket,
            Key: fileName,
            Body: optimized,
            ContentType: `image/jpeg`
          },
          next
        );
      }
    ],
    function(error) {
      if (error) {
        console.error(error);
      } else {
        console.log("Success");
      }
    }
  );
};
