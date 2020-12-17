<?php

// this is an excerpt of the code used within wordpress

$filename = get_query_var('report-pdf', false);
if( $filename === false ){
    return;
}
$nonce = isset( $_POST['nonce'] ) ? $_POST['nonce'] : null;
if( !$nonce || !wp_verify_nonce( $nonce, 'assessment-pdf')){
    return;
}
if( !isset($_POST['pdf']) ){
    return;
}

header('Content-Type: application/pdf');
header("Content-Disposition: attachment; filename={$filename}.pdf");
echo base64_decode( $_POST['pdf'] );
exit;