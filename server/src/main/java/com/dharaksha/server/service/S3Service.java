package com.dharaksha.server.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3ClientBuilder;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class S3Service {

    @Value("${aws.s3.accessKey}")
    private String accessKey;

    @Value("${aws.s3.secretKey}")
    private String secretKey;

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.s3.bucketName}")
    private String bucketName;

    private S3Client s3Client;

    @PostConstruct
    public void init() {
        this.accessKey = (accessKey != null) ? accessKey.trim() : "";
        this.secretKey = (secretKey != null) ? secretKey.trim() : "";
        this.region = (region != null) ? region.trim() : "ap-south-1";

        System.out.println("Initializing S3 Service...");
        System.out.println("Region: [" + region + "]");
        System.out.println("Access Key (first 4): " + (accessKey.length() > 4 ? accessKey.substring(0, 4) : "N/A"));
        System.out.println("Secret Key (last 4): " + (secretKey.length() > 4 ? secretKey.substring(secretKey.length() - 4) : "N/A"));
        System.out.println("Secret Key Length: " + secretKey.length());

        S3ClientBuilder builder = S3Client.builder()
                .region(Region.of(region));

        if (!accessKey.isEmpty() && !accessKey.startsWith("${") &&
            !secretKey.isEmpty() && !secretKey.startsWith("${")) {
            builder.credentialsProvider(StaticCredentialsProvider.create(
                    AwsBasicCredentials.create(accessKey, secretKey)));
            System.out.println("Using static credentials provider");
        } else {
            builder.credentialsProvider(DefaultCredentialsProvider.create());
            System.out.println("Using default credentials provider");
        }

        s3Client = builder.build();
    }

    //? this will upload  one image at a time
    public String uploadFile(MultipartFile file) throws IOException {
        String originalFileName = file.getOriginalFilename();
        String sanitizedOriginalName = originalFileName != null ? originalFileName.replaceAll("[^a-zA-Z0-9.\\-_]", "_") : "image";
        String fileName = System.currentTimeMillis() + "_" + sanitizedOriginalName;

        System.out.println("Uploading to bucket: [" + bucketName + "] with key: [" + fileName + "]");
        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucketName)
                .key(fileName)
                .contentType(file.getContentType())
                .overrideConfiguration(o -> o.putHeader("x-amz-content-sha256", "UNSIGNED-PAYLOAD"))
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(file.getBytes()));

        return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, fileName);
    }

    // ! return the all url of s3 to controller...
    public List<String> uploadFiles(List<MultipartFile> files) throws IOException {
        List<String> fileUrls = new ArrayList<>();

        for (MultipartFile file : files) {
            fileUrls.add(uploadFile(file));
        }

        return fileUrls;
    }

    public String generatePresignedUrl(String rawUrl) {
        if (rawUrl == null || !rawUrl.contains(".amazonaws.com/")) {
            return rawUrl;
        }
        try {
            String key = rawUrl.substring(rawUrl.indexOf(".amazonaws.com/") + 15);
            software.amazon.awssdk.services.s3.presigner.S3Presigner presigner;
            
            software.amazon.awssdk.services.s3.presigner.S3Presigner.Builder builder = software.amazon.awssdk.services.s3.presigner.S3Presigner.builder()
                    .region(Region.of(region));

            if (!accessKey.isEmpty() && !accessKey.startsWith("${") &&
                !secretKey.isEmpty() && !secretKey.startsWith("${")) {
                builder.credentialsProvider(StaticCredentialsProvider.create(
                        AwsBasicCredentials.create(accessKey, secretKey)));
            } else {
                builder.credentialsProvider(DefaultCredentialsProvider.create());
            }
            
            presigner = builder.build();

            software.amazon.awssdk.services.s3.model.GetObjectRequest getObjectRequest =
                    software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                            .bucket(bucketName)
                            .key(key)
                            .build();

            software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest getObjectPresignRequest =
                    software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.builder()
                            .signatureDuration(java.time.Duration.ofMinutes(60))
                            .getObjectRequest(getObjectRequest)
                            .build();

            software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest presignedGetObjectRequest =
                    presigner.presignGetObject(getObjectPresignRequest);

            return presignedGetObjectRequest.url().toString();
        } catch (Exception e) {
            System.err.println("Error generating presigned URL: " + e.getMessage());
            return rawUrl; // fallback to raw URL
        }
    }
}
