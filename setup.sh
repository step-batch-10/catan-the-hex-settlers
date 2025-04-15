#!/bin/sh

chmod +x ./hooks/*
cp ./hooks/* .git/hooks

echo "Repo Setup Succesful ✅"