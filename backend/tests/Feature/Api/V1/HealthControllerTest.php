<?php

declare(strict_types=1);

it('reports that the API is up', function (): void {
    $this->getJson('/api/v1/health')
        ->assertOk()
        ->assertExactJson(['status' => 'ok']);
});
