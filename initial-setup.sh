#!/bin/bash

curl -X POST -b"player-id=p1; game-id=1000" -d "id=v1,-2|2,-2|2,-3" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p1; game-id=1000" -d "id=e-v1,-1|1,-2|2,-2_v1,-2|2,-2|2,-3" localhost:3000/game/build/edge

curl -X POST -b"player-id=p2; game-id=1000" -d "id=v0,-1|1,-1|1,-2" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p2; game-id=1000" -d "id=e-v0,-1|0,0|1,-1_v0,-1|1,-1|1,-2" localhost:3000/game/build/edge

curl -X POST -b"player-id=p3; game-id=1000" -d "id=v-1,-1|0,-1|0,-2" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p3; game-id=1000" -d "id=e-v-1,-1|-1,0|0,-1_v-1,-1|0,-1|0,-2" localhost:3000/game/build/edge

curl -X POST -b"player-id=p4; game-id=1000" -d "id=v-1,0|0,-1|0,0" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p4; game-id=1000" -d "id=e-v-1,0|-1,1|0,0_v-1,0|0,-1|0,0" localhost:3000/game/build/edge

curl -X POST -b"player-id=p4; game-id=1000" -d "id=v0,0|0,1|1,0" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p4; game-id=1000" -d "id=e-v0,0|0,1|1,0_v0,0|1,-1|1,0" localhost:3000/game/build/edge

curl -X POST -b"player-id=p3; game-id=1000" -d "id=v-1,1|-1,2|-2,2" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p3; game-id=1000" -d "id=e-v-1,1|-1,2|-2,2_v-1,2|-2,2|-2,3" localhost:3000/game/build/edge

curl -X POST -b"player-id=p2; game-id=1000" -d "id=v-2,0|-2,1|-3,1" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p2; game-id=1000" -d "id=e-v-1,0|-2,0|-2,1_v-2,0|-2,1|-3,1" localhost:3000/game/build/edge

curl -X POST -b"player-id=p1; game-id=1000" -d "id=v-2,-1|-2,0|-3,0" localhost:3000/game/build/vertex
curl -X POST  -b"player-id=p1; game-id=1000" -d "id=e-v-1,-1|-2,-1|-2,0_v-2,-1|-2,0|-3,0" localhost:3000/game/build/edge
