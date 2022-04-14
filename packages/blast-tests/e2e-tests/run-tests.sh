#!/bin/bash
source ./packages/blast-tests/e2e-tests/vars.sh

echo '- Executing node-start-status.test.sh...'
$TESTS_FOLDER/node-start-status.test.sh
if [[ ! $? == 0 ]]; then
    exit_status=$?
    start_node
fi

exit $exit_status