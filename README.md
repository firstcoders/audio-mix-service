# sound.ws/audio-mix-service

## Development

## Testing

Run

```bash
yarn test
yarn test:e2e
```

## Deploying

1. `cp .env.dist .env` and fill out the values.
2. Run `make build`
3. Run `make deploy` (with appropriate AWS credentials set as envs)
