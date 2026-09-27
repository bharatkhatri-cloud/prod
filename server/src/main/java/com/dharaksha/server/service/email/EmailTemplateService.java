package com.dharaksha.server.service.email;

import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.util.FileCopyUtils;

import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.Map;

// This service is like a Mad Libs generator.
// It takes a pre-written story (HTML file) that has blank spaces like {{name}}
// and fills in the blanks with actual information (like "John Doe").
@Slf4j
@Service
public class EmailTemplateService {

    // This method opens an HTML file, finds the blank spots, and replaces them with real words.
    public String loadTemplate(String templateName, Map<String, String> placeholders) {
        try {
            // Find the template file inside the resources folder.
            ClassPathResource resource = new ClassPathResource("templates/" + templateName);
            
            // Read the template file line by line.
            InputStreamReader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8);
            String content = FileCopyUtils.copyToString(reader);
            
            // Go through each placeholder value we want to swap.
            for (Map.Entry<String, String> entry : placeholders.entrySet()) {
                String val = entry.getValue();
                String replacement = val != null ? val : "";
                
                // Swap the blank space {{placeholderName}} with the real value.
                content = content.replace("{{" + entry.getKey() + "}}", replacement);
            }
            
            // Return the finished HTML page as text.
            return content;
        } catch (Exception e) {
            // If the file couldn't be loaded or read, log the error.
            log.error("Failed to load email template: {}", templateName, e);
            throw new RuntimeException("Email template loading failed for: " + templateName, e);
        }
    }
}
