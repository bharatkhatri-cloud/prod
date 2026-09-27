const mongoose = require('mongoose');

const dbUrl = 'mongodb+srv://serverTeam:Ankit%404202@dharakshadb.rodoa.mongodb.net/dharaksha?retryWrites=true&w=majority&appName=dharakshaDB';

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(dbUrl);
    console.log('Connected!');

    const db = mongoose.connection.db;

    // List collections
    const collections = await db.listCollections().toArray();
    console.log('Collections in database:', collections.map(c => c.name));

    // Inspect lcpreparations
    const lcpreparationsCount = await db.collection('lcpreparations').countDocuments();
    console.log(`Total lcpreparations: ${lcpreparationsCount}`);
    if (lcpreparationsCount > 0) {
      const samples = await db.collection('lcpreparations').find().limit(3).toArray();
      console.log('Sample lcpreparations:');
      for (const sample of samples) {
        console.log({
          lcId: sample.lcId,
          lcPreparationTime: sample.lcPreparationTime,
          typeOfPreparationTime: sample.lcPreparationTime ? sample.lcPreparationTime.constructor.name : 'null',
          rawType: typeof sample.lcPreparationTime
        });
      }
      
      const stats = await db.collection('lcpreparations').aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$lcPreparationTime' },
            maxDate: { $max: '$lcPreparationTime' }
          }
        }
      ]).toArray();
      console.log('lcpreparations date range stats:', stats);
    }

    // Inspect lcrejections
    const lcrejectionsCount = await db.collection('lcrejections').countDocuments();
    console.log(`Total lcrejections: ${lcrejectionsCount}`);
    if (lcrejectionsCount > 0) {
      const samples = await db.collection('lcrejections').find().limit(3).toArray();
      console.log('Sample lcrejections:');
      for (const sample of samples) {
        console.log({
          lcId: sample.lcId,
          lcRejectionTime: sample.lcRejectionTime,
          typeOfRejectionTime: sample.lcRejectionTime ? sample.lcRejectionTime.constructor.name : 'null',
          rawType: typeof sample.lcRejectionTime
        });
      }

      const stats = await db.collection('lcrejections').aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$lcRejectionTime' },
            maxDate: { $max: '$lcRejectionTime' }
          }
        }
      ]).toArray();
      console.log('lcrejections date range stats:', stats);
    }

    // Inspect baginoculations
    const baginoculationsCount = await db.collection('baginoculations').countDocuments();
    console.log(`Total baginoculations: ${baginoculationsCount}`);
    if (baginoculationsCount > 0) {
      const samples = await db.collection('baginoculations').find().limit(3).toArray();
      console.log('Sample baginoculations:');
      for (const sample of samples) {
        console.log({
          bagId: sample.bagId,
          inoculationTimeStamp: sample.inoculationTimeStamp,
          typeOfInoculationTimeStamp: sample.inoculationTimeStamp ? sample.inoculationTimeStamp.constructor.name : 'null',
          rawType: typeof sample.inoculationTimeStamp
        });
      }

      const stats = await db.collection('baginoculations').aggregate([
        {
          $group: {
            _id: null,
            minDate: { $min: '$inoculationTimeStamp' },
            maxDate: { $max: '$inoculationTimeStamp' }
          }
        }
      ]).toArray();
      console.log('baginoculations date range stats:', stats);
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected!');
  }
}

run();
