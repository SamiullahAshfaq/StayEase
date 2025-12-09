package com.stayease.user.entity;

public enum ActivityType {
    // Authentication
    LOGIN,
    LOGOUT,
    REGISTER,
    PROFILE_UPDATE,
    PASSWORD_CHANGE,

    // Listings
    LISTING_VIEW,
    LISTING_CREATE,
    LISTING_UPDATE,
    LISTING_DELETE,
    LISTING_FAVORITE_ADD,
    LISTING_FAVORITE_REMOVE,

    // Bookings
    BOOKING_CREATE,
    BOOKING_CANCEL,
    BOOKING_UPDATE,

    // Reviews
    REVIEW_CREATE,
    REVIEW_UPDATE,
    REVIEW_DELETE,

    // Search
    SEARCH_PERFORMED,
    FILTER_APPLIED,

    // Account
    EMAIL_VERIFIED,
    ACCOUNT_DELETED
}
