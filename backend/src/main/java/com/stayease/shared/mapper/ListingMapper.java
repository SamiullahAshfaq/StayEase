package com.stayease.shared.mapper;

import com.stayease.domain.listing.dto.CreateListingDTO;
import com.stayease.domain.listing.dto.ListingDTO;
import com.stayease.domain.listing.dto.ListingImageDTO;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.entity.ListingImage;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class ListingMapper {

    public ListingDTO toDTO(Listing listing) {
        if (listing == null) {
            return null;
        }

        return ListingDTO.builder()
                .publicId(listing.getPublicId())
                .landlordPublicId(listing.getLandlordPublicId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .location(listing.getLocation())
                .price(listing.getPrice())
                .currency(listing.getCurrency())
                .guests(listing.getGuests())
                .bedrooms(listing.getBedrooms())
                .beds(listing.getBeds())
                .bathrooms(listing.getBathrooms())
                .category(listing.getCategory())
                .rules(listing.getRules())
                .images(listing.getImages().stream()
                        .map(this::imageToDTO)
                        .collect(Collectors.toList()))
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    public Listing toEntity(CreateListingDTO dto) {
        if (dto == null) {
            return null;
        }

        return Listing.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .price(dto.getPrice())
                .currency(dto.getCurrency())
                .guests(dto.getGuests())
                .bedrooms(dto.getBedrooms())
                .beds(dto.getBeds())
                .bathrooms(dto.getBathrooms())
                .category(dto.getCategory())
                .rules(dto.getRules())
                .build();
    }

    public ListingImageDTO imageToDTO(ListingImage image) {
        if (image == null) {
            return null;
        }

        return ListingImageDTO.builder()
                .id(image.getId())
                .url(image.getUrl())
                .caption(image.getCaption())
                .sortOrder(image.getSortOrder())
                .build();
    }

    public ListingImage imageToEntity(String url, Integer sortOrder) {
        return ListingImage.builder()
                .url(url)
                .sortOrder(sortOrder != null ? sortOrder : 0)
                .build();
    }
}