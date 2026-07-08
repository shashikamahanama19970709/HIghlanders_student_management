import { MongoClient, Db } from 'mongodb';

const options = {};

let clientPromise: Promise<MongoClient> | null = null;

function getClientPromise(): Promise<MongoClient> {
  if (!process.env.MONGODB_URI) {
    throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
  }

  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGODB_URI;

  if (process.env.NODE_ENV === 'development') {
    // In development mode, use a global variable so that the value
    // is preserved across module reloads caused by HMR (Hot Module Replacement).
    let globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(uri, options);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise!;
  } else {
    // In production mode, it's best to not use a global variable.
    const client = new MongoClient(uri, options);
    clientPromise = client.connect();
  }

  return clientPromise;
}

export default getClientPromise;

export async function getDatabase(): Promise<Db> {
  const client = await getClientPromise();
  return client.db('highlanders-taekwondo');
}
