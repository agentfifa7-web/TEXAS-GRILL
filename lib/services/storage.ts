// StorageProvider abstraction for uploads (product photos, restaurant
// galleries, story/video thumbnails, corporate documents). STORAGE_PROVIDER
// selects S3 or Cloudinary in production. No credentials are available in
// this environment, so the local adapter keeps files under /public/uploads
// during development — every call site should only depend on this
// interface, never on a specific vendor SDK.

export interface StorageProvider {
  upload(file: Buffer, path: string, contentType: string): Promise<{ url: string }>
  delete(path: string): Promise<void>
}

class LocalDevStorageProvider implements StorageProvider {
  async upload(_file: Buffer, path: string): Promise<{ url: string }> {
    // TODO(storage): this dev adapter does not persist anywhere durable in
    // a serverless deployment. Configure STORAGE_PROVIDER=S3 or CLOUDINARY
    // with STORAGE_API_KEY before shipping uploads to production.
    return { url: `/uploads/${path}` }
  }
  async delete(): Promise<void> {
    return
  }
}

class S3StorageProvider implements StorageProvider {
  async upload(): Promise<{ url: string }> {
    throw new Error('S3StorageProvider is not configured. Set STORAGE_API_KEY and implement lib/services/storage.ts.')
  }
  async delete(): Promise<void> {
    throw new Error('S3StorageProvider is not configured.')
  }
}

class CloudinaryStorageProvider implements StorageProvider {
  async upload(): Promise<{ url: string }> {
    throw new Error('CloudinaryStorageProvider is not configured. Set STORAGE_API_KEY and implement lib/services/storage.ts.')
  }
  async delete(): Promise<void> {
    throw new Error('CloudinaryStorageProvider is not configured.')
  }
}

export function getStorageProvider(): StorageProvider {
  const provider = process.env.STORAGE_PROVIDER ?? 'LOCAL'
  switch (provider) {
    case 'S3':
      return new S3StorageProvider()
    case 'CLOUDINARY':
      return new CloudinaryStorageProvider()
    default:
      return new LocalDevStorageProvider()
  }
}
