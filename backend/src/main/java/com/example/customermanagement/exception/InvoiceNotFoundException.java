
// InvoiceNotFoundException.java
package com.example.customermanagement.exception;

public class InvoiceNotFoundException extends RuntimeException {
    public InvoiceNotFoundException(String message) {
        super(message);
    }
}
