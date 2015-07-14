define([
    'jquery',
    'clientCore/notify/notify.service',
    'kernel/security/security.service',
    'clientCore/modal/modal.service'
], function ($, $mNotify, $mSecurity, $mModal) {
    $mNotify.setContainer($('.mue-notify'));

    $mSecurity.setSignPage({
        fragment: 'sign'
    });

    $mSecurity.setAfterAuth({
        fragment: 'dashboard/application'
    });

    $mModal.setContainer($('.mue-modal'));
});