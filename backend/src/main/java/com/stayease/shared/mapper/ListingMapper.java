package com.stayease.shared.mapper;

import com.stayease.domain.listing.dto.CreateListingDTO;
import com.stayease.domain.listing.dto.ListingDTO;
import com.stayease.domain.listing.dto.ListingImageDTO;
import com.stayease.domain.listing.dto.UpdateListingDTO;
import com.stayease.domain.listing.entity.Listing;
import com.stayease.domain.listing.entity.ListingImage;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ListingMapper {

    public ListingDTO toDTO(Listing listing) {
        if (listing == null) {
            return null;
        }

        List<ListingImageDTO> imageDTOs = listing.getImages() != null ? listing.getImages().stream()
                .map(this::toImageDTO)
                .collect(Collectors.toList()) : List.of();

        String coverImageUrl = listing.getImages() != null && !listing.getImages().isEmpty()
                ? listing.getImages().stream()
                        .filter(img -> Boolean.TRUE.equals(img.getIsCover()))
                        .findFirst()
                        .or(() -> listing.getImages().stream().findFirst())
                        .map(ListingImage::getUrl)
                        .orElse(null)
                : null;

        return ListingDTO.builder()
                .publicId(listing.getPublicId())
                .landlordPublicId(listing.getLandlordPublicId())
                .title(listing.getTitle())
                .description(listing.getDescription())
                .location(listing.getLocation())
                .city(listing.getCity())
                .country(listing.getCountry())
                .latitude(listing.getLatitude())
                .longitude(listing.getLongitude())
                .address(listing.getAddress())
                .pricePerNight(listing.getPricePerNight())
                .currency(listing.getCurrency())
                .maxGuests(listing.getMaxGuests())
                .bedrooms(listing.getBedrooms())
                .beds(listing.getBeds())
                .bathrooms(listing.getBathrooms())
                .propertyType(listing.getPropertyType())
                .category(listing.getCategory())
                .amenities(listing.getAmenities())
                .houseRules(listing.getHouseRules())
                .cancellationPolicy(listing.getCancellationPolicy())
                .minimumStay(listing.getMinimumStay())
                .maximumStay(listing.getMaximumStay())
                .instantBook(listing.getInstantBook())
                .status(listing.getStatus())
                .images(imageDTOs)
                .coverImageUrl(coverImageUrl)
                .createdAt(listing.getCreatedAt())
                .updatedAt(listing.getUpdatedAt())
                .build();
    }

    public Listing toEntity(CreateListingDTO dto) {
        if (dto == null) {
            return null;
        }

        Listing listing = Listing.builder()
                .title(dto.getTitle())
                .description(dto.getDescription())
                .location(dto.getLocation())
                .city(dto.getCity())
                .country(dto.getCountry())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .address(dto.getAddress())
                .pricePerNight(dto.getPricePerNight())
                .currency(dto.getCurrency())
                .maxGuests(dto.getMaxGuests())
                .bedrooms(dto.getBedrooms())
                .beds(dto.getBeds())
                .bathrooms(dto.getBathrooms())
                .propertyType(dto.getPropertyType())
                .category(dto.getCategory())
                .amenities(dto.getAmenities())
                .houseRules(dto.getHouseRules())
                .cancellationPolicy(dto.getCancellationPolicy())
                .minimumStay(dto.getMinimumStay())
                .maximumStay(dto.getMaximumStay())
                .instantBook(dto.getInstantBook())
                .status(dto.getStatus() != null ? Listing.ListingStatus.valueOf(dto.getStatus())
                        : Listing.ListingStatus.DRAFT)
                .build();

        if (dto.getImages() != null) {
            dto.getImages().forEach(imgDto -> {
                ListingImage image = toImageEntity(imgDto);
                listing.addImage(image);
            });
        }

        return listing;
    }

    public void updateEntity(Listing listing, UpdateListingDTO dto) {
        if (dto == null) {
            return;
        }

        if (dto.getTitle() != null)
            listing.setTitle(dto.getTitle());
        if (dto.getDescription() != null)
            listing.setDescription(dto.getDescription());
        if (dto.getLocation() != null)
            listing.setLocation(dto.getLocation());
        if (dto.getCity() != null)
            listing.setCity(dto.getCity());
        if (dto.getCountry() != null)
            listing.setCountry(dto.getCountry());
        if (dto.getLatitude() != null)
            listing.setLatitude(dto.getLatitude());
        if (dto.getLongitude() != null)
            listing.setLongitude(dto.getLongitude());
        if (dto.getAddress() != null)
            listing.setAddress(dto.getAddress());
        if (dto.getPricePerNight() != null)
            listing.setPricePerNight(dto.getPricePerNight());
        if (dto.getCurrency() != null)
            listing.setCurrency(dto.getCurrency());
        if (dto.getMaxGuests() != null)
            listing.setMaxGuests(dto.getMaxGuests());
        if (dto.getBedrooms() != null)
            listing.setBedrooms(dto.getBedrooms());
        if (dto.getBeds() != null)
            listing.setBeds(dto.getBeds());
        if (dto.getBathrooms() != null)
            listing.setBathrooms(dto.getBathrooms());
        if (dto.getPropertyType() != null)
            listing.setPropertyType(dto.getPropertyType());
        if (dto.getCategory() != null)
            listing.setCategory(dto.getCategory());
        if (dto.getAmenities() != null)
            listing.setAmenities(dto.getAmenities());
        if (dto.getHouseRules() != null)
            listing.setHouseRules(dto.getHouseRules());
        if (dto.getCancellationPolicy() != null)
            listing.setCancellationPolicy(dto.getCancellationPolicy());
        if (dto.getMinimumStay() != null)
            listing.setMinimumStay(dto.getMinimumStay());
        if (dto.getMaximumStay() != null)
            listing.setMaximumStay(dto.getMaximumStay());
        if (dto.getInstantBook() != null)
            listing.setInstantBook(dto.getInstantBook());
        if (dto.getStatus() != null)
            listing.setStatus(dto.getStatus());

        if (dto.getImages() != null) {
            listing.getImages().clear();
            dto.getImages().forEach(imgDto -> {
                ListingImage image = toImageEntity(imgDto);
                listing.addImage(image);
            });
        }
    }

    public ListingImageDTO toImageDTO(ListingImage image) {
        if (image == null) {
            return null;
        }

        return ListingImageDTO.builder()
                .id(image.getId())
                .url(image.getUrl())
                .caption(image.getCaption())
                .isCover(image.getIsCover())
                .sortOrder(image.getSortOrder())
                .build();
    }

    public ListingImage toImageEntity(ListingImageDTO dto) {
        if (dto == null) {
            return null;
        }

        return ListingImage.builder()
                .url(dto.getUrl())
                .caption(dto.getCaption())
                .isCover(dto.getIsCover())
                .sortOrder(dto.getSortOrder())
                .build();
    }

    public List<ListingDTO> toDTOList(List<Listing> listings) {
        return listings.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}