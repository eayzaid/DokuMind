package com.example.platformgateway.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class RagPipelineService {

    private final WebClient webClient;

    public RagPipelineService(@Value("${rag.pipeline.url}") String ragUrl) {
        this.webClient = WebClient.builder().baseUrl(ragUrl).build();
    }

    public Mono<Map> ingestDocument(MultipartFile file, String tenantId) throws Exception {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename();
            }
        });
        body.add("tenant_id", tenantId);

        return webClient.post()
                .uri("/api/ingest")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData(body))
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Flux<String> chatStream(Map<String, Object> chatRequest) {
        return webClient.post()
                .uri("/api/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(chatRequest)
                .retrieve()
                .bodyToFlux(String.class);
    }

    public Mono<Map> getDocuments(String tenantId) {
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/documents")
                        .queryParam("tenant_id", tenantId)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }

    public Mono<Map> deleteDocument(String filename, String tenantId) {
        return webClient.delete()
                .uri(uriBuilder -> uriBuilder
                        .path("/api/documents")
                        .queryParam("filename", filename)
                        .queryParam("tenant_id", tenantId)
                        .build())
                .retrieve()
                .bodyToMono(Map.class);
    }
}
