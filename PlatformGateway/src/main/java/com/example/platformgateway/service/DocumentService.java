package com.example.platformgateway.service;

import com.example.platformgateway.exception.NonAuthenticatedAccessException;
import com.example.platformgateway.model.dto.common.JwtPayloadDTO;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.io.InputStream;
import java.util.Map;
import java.util.Optional;

@Service
public class DocumentService {

    private final MinioService minioService;
    private final RagPipelineService ragPipelineService;

    public DocumentService(MinioService minioService, RagPipelineService ragPipelineService) {
        this.minioService = minioService;
        this.ragPipelineService = ragPipelineService;
    }

    private String getTenantId() {
        return Optional.ofNullable(SecurityContextHolder.getContext().getAuthentication())
                .map(Authentication::getPrincipal)
                .filter(JwtPayloadDTO.class::isInstance)
                .map(JwtPayloadDTO.class::cast)
                .map(payload -> payload.companyId().toString())
                .orElseThrow(() -> new NonAuthenticatedAccessException("Access Denied, Non Authenticated"));
    }

    public Mono<ResponseEntity<Map>> ingestDocument(MultipartFile file) {
        String tenantId;
        try {
            tenantId = getTenantId();
        } catch (Exception e) {
            return Mono.just(ResponseEntity.status(401).body(Map.of("error", e.getMessage())));
        }

        String filename = file.getOriginalFilename();
        if (filename == null || filename.isEmpty()) {
            return Mono.just(ResponseEntity.badRequest().body(Map.of("error", "Filename cannot be empty")));
        }

        String minioObjectName = tenantId + "/" + filename;

        try {
            minioService.uploadFile(minioObjectName, file);
            return ragPipelineService.ingestDocument(file, tenantId)
                    .map(ResponseEntity::ok)
                    .onErrorResume(e -> Mono.just(ResponseEntity.status(500).body(Map.of("error", "RAG Pipeline ingestion failed: " + e.getMessage()))));
        } catch (Exception e) {
            return Mono.just(ResponseEntity.status(500).body(Map.of("error", "Minio upload failed: " + e.getMessage())));
        }
    }

    public Flux<String> chatStream(Map<String, Object> chatRequest) {
        String tenantId = getTenantId();
        chatRequest.put("tenant_id", tenantId);
        return ragPipelineService.chatStream(chatRequest);
    }

    public Mono<ResponseEntity<Map>> listDocuments() {
        String tenantId;
        try {
            tenantId = getTenantId();
        } catch (Exception e) {
            return Mono.just(ResponseEntity.status(401).body(Map.of("error", e.getMessage())));
        }
        return ragPipelineService.getDocuments(tenantId)
                .map(ResponseEntity::ok);
    }

    public Mono<ResponseEntity<Map>> deleteDocument(String filename) {
        String tenantId;
        try {
            tenantId = getTenantId();
        } catch (Exception e) {
            return Mono.just(ResponseEntity.status(401).body(Map.of("error", e.getMessage())));
        }

        String minioObjectName = tenantId + "/" + filename;

        try {
            minioService.removeFile(minioObjectName);
        } catch (Exception e) {
            // Ignore minio deletion error to ensure RAG Pipeline is still attempted
        }

        return ragPipelineService.deleteDocument(filename, tenantId)
                .map(ResponseEntity::ok);
    }

    public ResponseEntity<Resource> previewDocument(String filename) {
        String tenantId = getTenantId();
        String minioObjectName = tenantId + "/" + filename;

        try {
            InputStream is = minioService.getFile(minioObjectName);
            InputStreamResource resource = new InputStreamResource(is);
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_PDF)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(404).build();
        }
    }
}
