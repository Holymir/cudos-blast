#!/bin/bash
source ./packages/blast-tests/e2e-tests/vars.sh

init_folder="$INIT_FOLDER-compile"
cp -R template $init_folder &> /dev/null
cd $init_folder

echo -n 'blast compile...'

blast compile &> /dev/null
cd artifacts
if [[ ! `ls` == $COMPILE_FILES ]]; then
    echo -e "$FAILED\nInvalid artifacts!" 1>&2
    exit_status=1
else
    echo -e $PASSED
fi

echo -n 'blast run...'
cd ..
if [[ $exit_status == 1 ]]; then
    docker run --rm -v "`pwd`":/code  --mount type=volume,source="contracts_cache",target=/code/target --mount type=volume,source=registry_cache,target=/usr/local/cargo/registry cosmwasm/workspace-optimizer:0.12.3 &> /dev/null
fi

if [[ ! `blast run ./scripts/deploy.js` =~ 'cudos' ]]; then
    echo -e $FAILED
    exit_status=1
else
    echo -e $PASSED
fi

echo -n 'blast run -n [network]...'
# Setup config to allow local node connection (and therefore successful run) only for passed --network parameter
# invalidate [localNetwork] and [defaultNetwork] values and add valid local network to [networks]
sed -i '' $'s|localNetwork: \'http://localhost:26657\'|localNetwork: \'https://sentry1.gcp-uscentral1.cudos.org:26657\'|' blast.config.js
sed -i '' $'s|defaultNetwork: \'\'|defaultNetwork: \'https://sentry1.gcp-uscentral1.cudos.org:26657\'|' blast.config.js
sed -i '' $'s|networks: {|networks: {\tlocalhost_test: \'http://localhost:26657\',|' blast.config.js

if [[ ! `blast run ./scripts/deploy.js -n localhost_test` =~ 'cudos' ]]; then
    echo -e $FAILED
    exit_status=1
else
    echo -e $PASSED
fi

rm -r ../$init_folder &> /dev/null || true
exit $exit_status