module.exports = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  title: 'StemJob',
  description: 'A job to mix stems',
  type: 'object',
  properties: {
    sources: {
      description: 'An array of urls pointing to source files',
      type: 'array',
      minItems: 1,
      maxItems: 15,
      items: {
        description: 'A source entity',
        type: 'object',
        required: ['src', 'volume'],
        properties: {
          src: {
            type: 'string',
            pattern: '^(s3|http|https)://.*$',
            maxLength: 2000,
          },
          volume: {
            type: 'number',
            minimum: 0,
            maximum: 1,
          },
        },
      },
    },
    filename: {
      description: 'The content-disposition filename',
      type: 'string',
      default: 'myMixedStems.wav',
    },
    metadata: {
      description: 'The metadata with which to embed the wav',
      type: 'array',
      minItems: 0,
      maxItems: 10,
      items: {
        description: 'A metadata key value entity',
        type: 'object',
        properties: {
          key: {
            type: 'string',
            description: 'key',
            enum: [
              'artist',
              'comment',
              'copyright',
              'date',
              'genre',
              'language',
              'title',
              'album',
              'track',
            ],
          },
          value: {
            type: 'string',
            description: 'the value',
          },
        },
      },
    },
  },
  required: ['sources'],
};
