define([
    'jquery',
    'core/notify/notify.service',
    'kernel/security/security.service',
    'core/modal/modal.service'
], function ($, $mNotify, $mSecurity, $mModal) {
    $mNotify.setContainer($('.mue-notify'));

    $mSecurity.setSignPage({
        fragment: 'sign'
    });

    $mSecurity.setAfterAuth({
        fragment: 'dashboard/profile'
    });

    $mModal.setContainer($('.mue-modal'));
});