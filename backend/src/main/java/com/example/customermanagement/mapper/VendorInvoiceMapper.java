package com.example.customermanagement.mapper;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.example.customermanagement.dto.VendorInvoiceDTO;
import com.example.customermanagement.dto.VendorInvoiceItemDTO;
import com.example.customermanagement.model.VendorInvoice;
import com.example.customermanagement.model.VendorInvoiceItem;

@Component
public class VendorInvoiceMapper {

    public VendorInvoiceDTO toDTO(VendorInvoice vendorInvoice) {
        if (vendorInvoice == null) {
            return null;
        }

        VendorInvoiceDTO dto = new VendorInvoiceDTO();
        dto.setId(vendorInvoice.getId());
        dto.setInvoiceNo(vendorInvoice.getInvoiceNo());
        dto.setVendorId(vendorInvoice.getVendorId());
        dto.setVendorName(vendorInvoice.getVendorName());
        dto.setVendorAddress(vendorInvoice.getVendorAddress());
        dto.setVendorPhone(vendorInvoice.getVendorPhone());
        dto.setDateTime(vendorInvoice.getDateTime());
        dto.setSubtotal(vendorInvoice.getSubtotal());
        dto.setTotalTax(vendorInvoice.getTotalTax());
        dto.setGrandTotal(vendorInvoice.getGrandTotal());
        dto.setCreatedAt(vendorInvoice.getCreatedAt());
        dto.setUpdatedAt(vendorInvoice.getUpdatedAt());

        if (vendorInvoice.getItems() != null) {
            List<VendorInvoiceItemDTO> itemDTOs = vendorInvoice.getItems().stream()
                    .map(this::toItemDTO)
                    .collect(Collectors.toList());
            dto.setItems(itemDTOs);
        }

        return dto;
    }

    public VendorInvoice toEntity(VendorInvoiceDTO dto) {
        if (dto == null) {
            return null;
        }

        VendorInvoice vendorInvoice = new VendorInvoice();
        vendorInvoice.setId(dto.getId());
        vendorInvoice.setInvoiceNo(dto.getInvoiceNo());
        vendorInvoice.setVendorId(dto.getVendorId());
        vendorInvoice.setVendorName(dto.getVendorName());
        vendorInvoice.setVendorAddress(dto.getVendorAddress());
        vendorInvoice.setVendorPhone(dto.getVendorPhone());
        vendorInvoice.setDateTime(dto.getDateTime());
        vendorInvoice.setSubtotal(dto.getSubtotal());
        vendorInvoice.setTotalTax(dto.getTotalTax());
        vendorInvoice.setGrandTotal(dto.getGrandTotal());

        if (dto.getItems() != null) {
            List<VendorInvoiceItem> items = dto.getItems().stream()
                    .map(itemDTO -> toItemEntity(itemDTO, vendorInvoice))
                    .collect(Collectors.toList());
            vendorInvoice.setItems(items);
        }

        return vendorInvoice;
    }

    public VendorInvoiceItemDTO toItemDTO(VendorInvoiceItem item) {
        if (item == null) {
            return null;
        }

        VendorInvoiceItemDTO dto = new VendorInvoiceItemDTO();
        dto.setId(item.getId());
        dto.setProductId(item.getProductId());
        dto.setProductName(item.getProductName());
        dto.setCategory(item.getCategory());
        dto.setQuantity(item.getQuantity());
        dto.setUnitPrice(item.getUnitPrice());
        dto.setCgstPercent(item.getCgstPercent());
        dto.setSgstPercent(item.getSgstPercent());
        dto.setTotal(item.getTotal());

        return dto;
    }

    public VendorInvoiceItem toItemEntity(VendorInvoiceItemDTO dto, VendorInvoice vendorInvoice) {
        if (dto == null) {
            return null;
        }

        VendorInvoiceItem item = new VendorInvoiceItem();
        item.setId(dto.getId());
        item.setVendorInvoice(vendorInvoice);
        item.setProductId(dto.getProductId());
        item.setProductName(dto.getProductName());
        item.setCategory(dto.getCategory());
        item.setQuantity(dto.getQuantity());
        item.setUnitPrice(dto.getUnitPrice());
        item.setCgstPercent(dto.getCgstPercent());
        item.setSgstPercent(dto.getSgstPercent());
        item.setTotal(dto.getTotal());

        return item;
    }

    public List<VendorInvoiceDTO> toDTOList(List<VendorInvoice> invoices) {
        return invoices.stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }
}