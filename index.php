<?php

/**
 * Laravel - A PHP Framework For Web Artisans
 * This file allows running Laravel from the root of public_html on shared hosting.
 */

// Change directory to public folder and run the app
chdir(__DIR__ . '/public');

// Include the main index.php from public folder
require __DIR__ . '/public/index.php';
