define([
    'jquery',
    'core/notify/notify.service',
    'kernel/security/security.service'
], function ($, $mNotify, $mSecurity) {
    $mNotify.setContainer($('.mue-notify'));

    $mSecurity.setSignPage({
        fragment: 'sign'
    });

    $mSecurity.setAfterAuth({
        fragment: 'dashboard/profile'
    });
});