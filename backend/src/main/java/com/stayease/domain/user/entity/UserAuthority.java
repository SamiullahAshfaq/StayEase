package com.stayease.domain.user.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "user_authority")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserAuthority {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "user_authority_seq")
    @SequenceGenerator(name = "user_authority_seq", sequenceName = "user_authority_seq", allocationSize = 50)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "authority_id", nullable = false)
    private Authority authority;

    @Column(name = "granted_at", nullable = false, updatable = false)
    private Instant grantedAt;

    @PrePersist
    protected void onCreate() {
        grantedAt = Instant.now();
    }
}