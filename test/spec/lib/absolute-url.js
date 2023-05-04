import assert from 'assert';
import absoluteUrl from '../../../src/lib/absolute-url';

describe('absolute-url', async () => {
  it('generates a execute-api url with stagename', async () => {
    const url = absoluteUrl('/get/it/here/123', {
      headers: {
        Host: 'j3ap25j034.execute-api.eu-west-2.amazonaws.com',
      },
      path: '/dev/jobs/c7405eb0-3fe4-11eb-b998-93cbcb853095/status',
      resource: '/jobs/{uuid}/status',
      requestContext: {
        stage: 'dev',
      },
    });

    assert.strictEqual(
      url,
      'https://j3ap25j034.execute-api.eu-west-2.amazonaws.com/dev/get/it/here/123'
    );
  });

  it('generates a custom domain url with apigw mapping', async () => {
    const url = absoluteUrl('/get/it/here/123', {
      headers: {
        Host: 'abc.com',
      },
      path: '/amix/jobs/c7405eb0-3fe4-11eb-b998-93cbcb853095/status',
      resource: '/jobs/{uuid}/status',
      pathParameters: {
        uuid: 'c7405eb0-3fe4-11eb-b998-93cbcb853095',
      },
    });

    assert.strictEqual(url, 'https://abc.com/amix/get/it/here/123');
  });

  it('generates a the x-forwarded-host value instead of the host', async () => {
    const url = absoluteUrl('/get/it/here/123', {
      headers: {
        Host: 'abc.com',
        'X-Forwarded-Host': 'def.com',
      },
      path: '/amix/jobs/c7405eb0-3fe4-11eb-b998-93cbcb853095/status',
      resource: '/jobs/{uuid}/status',
      pathParameters: {
        uuid: 'c7405eb0-3fe4-11eb-b998-93cbcb853095',
      },
    });

    assert.strictEqual(url, 'https://def.com/amix/get/it/here/123');
  });

  it('generates a custom domain url with apigw mapping without path params', async () => {
    const url = absoluteUrl('/get/it/here/123', {
      headers: {
        Host: 'abc.com',
      },
      path: '/amix/jobs/',
      resource: '/jobs/',
    });

    assert.strictEqual(url, 'https://abc.com/amix/get/it/here/123');
  });

  it('generates a localhost url', async () => {
    process.env.NODE_ENV = 'development';

    const url = absoluteUrl('/get/it/here/123', {
      headers: {
        Host: 'abc.local',
      },
    });

    assert.strictEqual(url, 'http://abc.local/dev/get/it/here/123');
  });
});
