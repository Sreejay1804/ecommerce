package com.example.customermanagement.service;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.customermanagement.dto.VendorInvoiceDTO;
import com.example.customermanagement.exception.ResourceNotFoundException;
import com.example.customermanagement.mapper.VendorInvoiceMapper;
import com.example.customermanagement.model.VendorInvoice;
import com.example.customermanagement.repository.VendorInvoiceRepository;

@Service
@Transactional
public class VendorInvoiceService {

    @Autowired
    private VendorInvoiceRepository vendorInvoiceRepository;

    @Autowired
    private VendorInvoiceMapper vendorInvoiceMapper;

    public List<VendorInvoiceDTO> getAllInvoices() {
        List<VendorInvoice> invoices = vendorInvoiceRepository.findAll();
        return vendorInvoiceMapper.toDTOList(invoices);
    }

    public VendorInvoiceDTO getInvoiceById(Long id) {
        Optional<VendorInvoice> invoice = vendorInvoiceRepository.findByIdWithItems(id);
        if (invoice.isPresent()) {
            return vendorInvoiceMapper.toDTO(invoice.get());
        } else {
            throw new ResourceNotFoundException("Vendor Invoice not found with id: " + id);
        }
    }

    public VendorInvoiceDTO getInvoiceByInvoiceNo(String invoiceNo) {
        Optional<VendorInvoice> invoice = vendorInvoiceRepository.findByInvoiceNo(invoiceNo);
        if (invoice.isPresent()) {
            return vendorInvoiceMapper.toDTO(invoice.get());
        } else {
            throw new ResourceNotFoundException("Vendor Invoice not found with invoice number: " + invoiceNo);
        }
    }

    public List<VendorInvoiceDTO> getInvoicesByVendorId(Long vendorId) {
        List<VendorInvoice> invoices = vendorInvoiceRepository.findByVendorId(vendorId);
        return vendorInvoiceMapper.toDTOList(invoices);
    }

    public List<VendorInvoiceDTO> getInvoicesByVendorName(String vendorName) {
        List<VendorInvoice> invoices = vendorInvoiceRepository.findByVendorNameContainingIgnoreCase(vendorName);
        return vendorInvoiceMapper.toDTOList(invoices);
    }

    public List<VendorInvoiceDTO> getInvoicesByDateRange(String startDate, String endDate) {
        List<VendorInvoice> invoices = vendorInvoiceRepository.findByDateTimeBetween(startDate, endDate);
        return vendorInvoiceMapper.toDTOList(invoices);
    }

    public VendorInvoiceDTO createInvoice(VendorInvoiceDTO invoiceDTO) {
        VendorInvoice vendorInvoice = vendorInvoiceMapper.toEntity(invoiceDTO);
        VendorInvoice savedInvoice = vendorInvoiceRepository.save(vendorInvoice);
        return vendorInvoiceMapper.toDTO(savedInvoice);
    }

    public VendorInvoiceDTO updateInvoice(Long id, VendorInvoiceDTO invoiceDTO) {
        Optional<VendorInvoice> existingInvoice = vendorInvoiceRepository.findById(id);
        if (existingInvoice.isPresent()) {
            VendorInvoice vendorInvoice = vendorInvoiceMapper.toEntity(invoiceDTO);
            vendorInvoice.setId(id);
            VendorInvoice updatedInvoice = vendorInvoiceRepository.save(vendorInvoice);
            return vendorInvoiceMapper.toDTO(updatedInvoice);
        } else {
            throw new ResourceNotFoundException("Vendor Invoice not found with id: " + id);
        }
    }

    public void deleteInvoice(Long id) {
        Optional<VendorInvoice> invoice = vendorInvoiceRepository.findById(id);
        if (invoice.isPresent()) {
            vendorInvoiceRepository.deleteById(id);
        } else {
            throw new ResourceNotFoundException("Vendor Invoice not found with id: " + id);
        }
    }

    public List<VendorInvoiceDTO> getInvoicesByInvoiceNo(String invoiceNo) {
        Optional<VendorInvoice> invoiceOpt = vendorInvoiceRepository.findByInvoiceNo(invoiceNo);
        List<VendorInvoice> invoices = invoiceOpt.map(List::of).orElse(List.of());
        return vendorInvoiceMapper.toDTOList(invoices);
    }

    public List<VendorInvoiceDTO> getInvoicesByMobile(String mobile) {
        List<VendorInvoice> invoices = vendorInvoiceRepository.findByVendorPhone(mobile);
        return vendorInvoiceMapper.toDTOList(invoices);
    }
}