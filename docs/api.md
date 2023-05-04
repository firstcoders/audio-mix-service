<!-- Generator: Widdershins v4.0.1 -->

<h1 id="audio-mix-service-api">Audio Mix Service API v1.0.0</h1>

> Scroll down for code samples, example requests and responses. Select a language for code samples from the tabs above or the mobile navigation menu.

A microservice that mixes/merges multiple audio files into a single file with different volumes for each audio file

Base URLs:

* <a href="https://api.example.com/v1">https://api.example.com/v1</a>

# Authentication

- HTTP Authentication, scheme: bearer 

<h1 id="audio-mix-service-api-default">Default</h1>

## createAudioMix

<a id="opIdcreateAudioMix"></a>

> Code samples

```http
POST https://api.example.com/v1/ HTTP/1.1
Host: api.example.com
Content-Type: application/json
Accept: application/json

```

`POST /`

*Create an audio mix*

Merges multiple source audio (WAV) files with different volume settings

> Body parameter

```json
{
  "sources": [
    {
      "src": "https://your-cdn.com/wavs/drums.wav",
      "volume": 1
    },
    {
      "src": "https://your-cdn.com/wavs/drums.wav",
      "volume": 1
    }
  ],
  "filename": "myMixedStems.wav",
  "metadata": [
    {
      "key": "artist",
      "value": "string"
    }
  ]
}
```

<h3 id="createaudiomix-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|body|body|[createMixRequestBody](#schemacreatemixrequestbody)|true|none|

> Example responses

> 303 Response

```json
{
  "message": "The request has been accepted"
}
```

<h3 id="createaudiomix-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|303|[See Other](https://tools.ietf.org/html/rfc7231#section-6.4.4)|Redirect to audio mix status|[MessageBody](#schemamessagebody)|

### Response Headers

|Status|Header|Type|Format|Description|
|---|---|---|---|---|
|303|Location|string|url|none|
|303|Access-Control-Allow-Origin|string||none|
|303|Access-Control-Allow-Headers|string||none|
|303|Access-Control-Expose-Headers|string||none|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

## getAudioMixStatus

<a id="opIdgetAudioMixStatus"></a>

> Code samples

```http
GET https://api.example.com/v1/status/{uuid} HTTP/1.1
Host: api.example.com
Accept: application/json

```

`GET /status/{uuid}`

*Get the status of a request*

<h3 id="getaudiomixstatus-parameters">Parameters</h3>

|Name|In|Type|Required|Description|
|---|---|---|---|---|
|uuid|path|string(uuid)|true|The request uuid|

> Example responses

> 200 Response

```json
{
  "message": "The request has been accepted",
  "_url": "https://youapi.com/status/b4d89bae-81e7-40c5-a76d-4f788997e7b1",
  "_retryIn": 5,
  "job": {
    "uuid": "b4d89bae-81e7-40c5-a76d-4f788997e7b1",
    "status": "STATUS_PROCESSING",
    "createdAt": "2022-02-09T07:47:28.691Z",
    "completedAt": "2022-02-09T07:49:28.691Z",
    "timeTaken": 4019
  }
}
```

<h3 id="getaudiomixstatus-responses">Responses</h3>

|Status|Meaning|Description|Schema|
|---|---|---|---|
|200|[OK](https://tools.ietf.org/html/rfc7231#section-6.3.1)|The request to get the status of the request was succesfull|[JobResponseBody](#schemajobresponsebody)|

<aside class="warning">
To perform this operation, you must be authenticated by means of one of the following methods:
bearerAuth
</aside>

# Schemas

<h2 id="tocS_createMixRequestBody">createMixRequestBody</h2>
<!-- backwards compatibility -->
<a id="schemacreatemixrequestbody"></a>
<a id="schema_createMixRequestBody"></a>
<a id="tocScreatemixrequestbody"></a>
<a id="tocscreatemixrequestbody"></a>

```json
{
  "sources": [
    {
      "src": "https://your-cdn.com/wavs/drums.wav",
      "volume": 1
    },
    {
      "src": "https://your-cdn.com/wavs/drums.wav",
      "volume": 1
    }
  ],
  "filename": "myMixedStems.wav",
  "metadata": [
    {
      "key": "artist",
      "value": "string"
    }
  ]
}

```

The request body to create a mix

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|sources|[object]|true|none|An array of urls pointing to source files|
|» src|string(url)|true|none|A URL to a stem file|
|» volume|number|true|none|none|
|filename|string|false|none|The content-disposition filename|
|metadata|[object]|false|none|The metadata with which to embed the wav|
|» key|string|false|none|key|
|» value|string|false|none|the value|

#### Enumerated Values

|Property|Value|
|---|---|
|key|artist|
|key|comment|
|key|copyright|
|key|date|
|key|genre|
|key|language|
|key|title|
|key|album|
|key|track|

<h2 id="tocS_MessageBody">MessageBody</h2>
<!-- backwards compatibility -->
<a id="schemamessagebody"></a>
<a id="schema_MessageBody"></a>
<a id="tocSmessagebody"></a>
<a id="tocsmessagebody"></a>

```json
{
  "message": "The request has been accepted"
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|message|string|true|none|none|

<h2 id="tocS_JobResponseBody">JobResponseBody</h2>
<!-- backwards compatibility -->
<a id="schemajobresponsebody"></a>
<a id="schema_JobResponseBody"></a>
<a id="tocSjobresponsebody"></a>
<a id="tocsjobresponsebody"></a>

```json
{
  "message": "The request has been accepted",
  "_url": "https://youapi.com/status/b4d89bae-81e7-40c5-a76d-4f788997e7b1",
  "_retryIn": 5,
  "job": {
    "uuid": "b4d89bae-81e7-40c5-a76d-4f788997e7b1",
    "status": "STATUS_PROCESSING",
    "createdAt": "2022-02-09T07:47:28.691Z",
    "completedAt": "2022-02-09T07:49:28.691Z",
    "timeTaken": 4019
  }
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|message|string|true|none|none|
|_url|string(url)|false|none|A url pointing to where to lookup the status of the pending request|
|_retryIn|integer(int32)|false|none|A hint about when to lookup the status of the pending request (in seconds)|
|job|[Job](#schemajob)|true|none|none|

<h2 id="tocS_Job">Job</h2>
<!-- backwards compatibility -->
<a id="schemajob"></a>
<a id="schema_Job"></a>
<a id="tocSjob"></a>
<a id="tocsjob"></a>

```json
{
  "uuid": "b4d89bae-81e7-40c5-a76d-4f788997e7b1",
  "status": "STATUS_PROCESSING",
  "createdAt": "2022-02-09T07:47:28.691Z",
  "completedAt": "2022-02-09T07:49:28.691Z",
  "timeTaken": 4019
}

```

### Properties

|Name|Type|Required|Restrictions|Description|
|---|---|---|---|---|
|uuid|string(uuid)|true|none|A uuid that identifies the request|
|status|string|true|none|The status of the request|
|createdAt|string(date-time)|true|none|A ISO date indicating when the request was received|
|completedAt|string(date-time)|false|none|An ISO date indicating when the request was completed|
|timeTaken|integer(int32)|false|none|The time (in miliseconds) it took to complete the request|

