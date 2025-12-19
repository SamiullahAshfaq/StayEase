package com.stayease.domain.payment.repository;

import com.stayease.domain.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByPublicId(UUID publicId);
    Optional<Payment> findByBookingPublicId(UUID bookingPublicId);
    Optional<Payment> findByTransactionId(String transactionId);
}
