/**
 * Copyright (C) 2019-2023 First Coders LTD
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */
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
