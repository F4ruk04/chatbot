#!/bin/sh
redis-cli -h "$REDIS_HOST" ping || exit 1
