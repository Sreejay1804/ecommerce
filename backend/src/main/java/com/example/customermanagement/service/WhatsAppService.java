package com.example.customermanagement.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.example.customermanagement.model.Invoice;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;

@Service
public class WhatsAppService {

    @Value("${whatsapp.api.url}")
    private String whatsappApiUrl;

    @Value("${whatsapp.api.token}")
    private String whatsappToken;

    private final WebClient webClient;

    public WhatsAppService(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    public boolean sendInvoiceNotification(Invoice invoice) {
        try {
            // Format mobile number
            String phone = invoice.getCustomerMobile().replaceAll("\\D", "");
            if (phone.length() == 10) {
                phone = "91" + phone; // Add India country code
            }

            ObjectMapper mapper = new ObjectMapper();
            ObjectNode messageData = mapper.createObjectNode();
            messageData.put("messaging_product", "whatsapp");
            messageData.put("to", phone);
            messageData.put("type", "template");

            ObjectNode template = mapper.createObjectNode();
            template.put("name", "invoice_notification");
            template.putObject("language").put("code", "en");

            ObjectNode component = mapper.createObjectNode();
            component.put("type", "body");
            component.putArray("parameters")
                    .add(mapper.createObjectNode().put("type", "text").put("text", invoice.getInvoiceNo()))
                    .add(mapper.createObjectNode().put("type", "text").put("text", invoice.getTotalAmount().toString()))
                    .add(mapper.createObjectNode().put("type", "text").put("text", invoice.getCustomerName()));

            template.putArray("components").add(component);
            messageData.set("template", template);

            JsonNode response = webClient.post()
                    .uri(whatsappApiUrl)
                    .header("Authorization", "Bearer " + whatsappToken)
                    .bodyValue(messageData)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            return response != null && response.has("messages");
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}