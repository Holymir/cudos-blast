#!/bin/bash
source ./packages/blast-tests/e2e-tests/vars.sh

echo -n 'blast node stop...'
cd template
blast node stop &> /dev/null
timer=3
sleep $timer
until [[ ! `docker ps` =~ $CONTAINER_NAME ]]; do
    if [[ $timer > 5 ]]; then
        echo -e "$FAILED\nNode was not stopped successfuly!\n'docker ps' should not contain $CONTAINER_NAME" 1>&2
        exit_status=1
        break
    fi
    sleep $timer
    ((timer=timer+1))
done;
if [[ ! $exit_status == 1 ]]; then
    echo -e $PASSED
fi

echo -n 'blast node status...'
if [[ $exit_status == 1 ]]; then
    $compose down &> /dev/null && sleep 5
fi
if [[ ! `blast node status` =~ 'offline' ]]; then
    echo -e $FAILED
    exit_status=1
else
    echo -e $PASSED
fi

exit $exit_status