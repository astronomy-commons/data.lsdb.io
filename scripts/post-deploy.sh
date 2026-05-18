pub_dir=/var/www/data.lsdb.io/html

# 1. Change group of everything to astro-lincc
find $pub_dir ! -group astro-lincc -exec chgrp astro-lincc {} +

# 2. Add group write to files
find $pub_dir -type f ! -perm -0020 -exec chmod g+w {} +

# 3. Add group write + setgid to directories
find $pub_dir -type d ! -perm -2020 -exec chmod g+ws {} +