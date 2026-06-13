# Utiliser l'image PHP officielle avec Apache
FROM php:8.1-apache

# Installer les extensions nécessaires (MySQL + SQLite)
RUN apt-get update && apt-get install -y libsqlite3-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_sqlite

# Activer le module de réécriture d'Apache (utile pour les routes si besoin)
RUN a2enmod rewrite

# Copier le code source du projet dans le dossier web d'Apache
COPY . /var/www/html/

# Donner les droits d'écriture au serveur web pour SQLite
RUN chown -R www-data:www-data /var/www/html/
RUN chmod -R 775 /var/www/html/server/

# Exposer le port 80
EXPOSE 80

# Définir le répertoire de travail
WORKDIR /var/www/html/
