#!/bin/bash
source ./packages/blast-tests/e2e-tests/vars.sh

echo '- Executing node-start-status.test.sh...'
$TESTS_FOLDER/node.test.sh

if [[ $? != 0 ]]; then
    echo ERROR!!
    exit_status=1
else
    echo PASSED!!
fi

exit $exit_status