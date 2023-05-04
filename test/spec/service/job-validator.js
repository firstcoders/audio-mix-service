/* eslint-disable jest/expect-expect */
import assert from 'assert';
import { Validator } from 'jsonschema';
import JobValidator from '../../../src/service/job-validator';
import schema from '../../../src/models/job-model';

describe('Job Validator', () => {
  let validator;

  beforeEach(() => {
    validator = new JobValidator({ validator: new Validator(), schema });
  });

  it('validates', () => {
    const assertValid = (result, validExpectation, expectedErrors = []) => {
      if (!validExpectation) assert(result.errors.length > 0);

      const actualErrors = result.errors.map((err) => `${err.property}|${err.message}`);

      expectedErrors.forEach((expectedError) => {
        assert(actualErrors.indexOf(expectedError) !== -1);
      });
    };

    assertValid(validator.validate({}), false, ['instance|requires property "sources"']);
    assertValid(validator.validate({ sources: 'blah' }), false, [
      'instance.sources|is not of a type(s) array',
    ]);
    // assertValid(validator.validate({ sources: [] }), false, [
    //   'instance.sources|does not meet minimum length of 2',
    // ]);
    assertValid(validator.validate({ sources: ['a', 'b'] }), false, [
      'instance.sources[0]|is not of a type(s) object',
    ]);
    assertValid(validator.validate({ sources: [{}, {}] }), false, [
      'instance.sources[0]|requires property "src"',
      'instance.sources[0]|requires property "volume"',
      'instance.sources[1]|requires property "src"',
      'instance.sources[1]|requires property "volume"',
    ]);
    assertValid(validator.validate({ sources: [{ src: null }, { src: null }] }), false, [
      'instance.sources[0]|requires property "volume"',
      'instance.sources[0].src|is not of a type(s) string',
      'instance.sources[1]|requires property "volume"',
      'instance.sources[1].src|is not of a type(s) string',
    ]);

    assertValid(
      validator.validate({
        sources: [
          { src: 'blah', volume: 1 },
          { src: 'blah', volume: 1 },
        ],
      }),
      false,
      [
        'instance.sources[0].src|does not match pattern "^(s3|http|https)://.*$"',
        'instance.sources[1].src|does not match pattern "^(s3|http|https)://.*$"',
      ]
    );

    assertValid(
      validator.validate({
        sources: [
          { src: 'https://get.it.here.com', volume: 1 },
          { src: 'https://get.it.here.com', volume: 1 },
        ],
      }),
      true
    );

    // console.log(validator.validate({}), false);
  });
});
