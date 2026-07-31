# Disposable local TYPO3 tutorial

This tutorial creates a temporary TYPO3 13.4 website on your computer, installs the SoLE map extension, and lets you test it without touching the real website. No previous TYPO3, PHP, Composer, database, or server knowledge is required.

The test site uses **DDEV**, which runs TYPO3, PHP, and MariaDB in containers. Everything belonging to the test is kept in one folder and can be deleted afterward.

## What you will create

At the end you will have:

- A local TYPO3 website at `https://sole-map-typo3-test.ddev.site`
- A TYPO3 administration area at `https://sole-map-typo3-test.ddev.site/typo3/`
- The SoLE map installed as a TYPO3 content plugin
- A temporary database containing only test data

This is not a production deployment. The initial setup requires internet access to download DDEV images, TYPO3 packages, JavaScript libraries, and map tiles.

## Vocabulary

- **Terminal**: The macOS application where you enter commands. Open it from Applications > Utilities > Terminal.
- **Docker provider**: Software that runs isolated containers. Docker Desktop or OrbStack can provide this on macOS.
- **DDEV**: A local-development tool that configures the web server, PHP, and database containers.
- **Composer**: PHP's package manager. DDEV runs it inside a container, so you do not need PHP or Composer installed directly on your Mac.
- **TYPO3 backend**: The password-protected administration area where editors create pages and content.
- **TYPO3 frontend**: The public page visitors see.
- **Extension**: An installable TYPO3 package. The SoLE map is an extension containing one frontend plugin.
- **Plugin/content element**: The map block that an editor places on a TYPO3 page.
- **TypoScript**: TYPO3 configuration that tells the frontend how to render pages and content.

## 1. Install the prerequisites

You need administrator rights on the Mac for the first installation.

### Install a Docker provider

Install and start one supported provider:

- [Docker Desktop](https://docs.docker.com/desktop/setup/install/mac-install/)
- [OrbStack](https://orbstack.dev/), if your organization already uses it

Wait until the provider reports that it is running. Docker Desktop displays this status in its menu-bar window.

### Install DDEV

The official installation instructions are at [ddev.com/get-started](https://ddev.com/get-started/).

On a Mac with Homebrew, run:

```bash
brew install ddev/ddev/ddev
```

If `brew` is not found, install Homebrew from [brew.sh](https://brew.sh/) or use DDEV's official macOS installer.

### Verify the tools

Open Terminal and run these commands one at a time:

```bash
docker version
ddev version
```

Both commands should print version information. If `docker version` says it cannot connect to the daemon, start Docker Desktop or OrbStack and try again.

## 2. Create an empty test project

The following commands create the test under your home directory. Run them one at a time:

```bash
cd ~
mkdir sole-map-typo3-test
cd sole-map-typo3-test
```

The directory must be empty. Check it with:

```bash
ls -la
```

Only `.` and `..` should be listed.

Configure DDEV for TYPO3 13:

```bash
ddev config --project-name=sole-map-typo3-test --project-type=typo3 --docroot=public --php-version=8.3
```

Start the containers:

```bash
ddev start
```

The first start can take several minutes because container images are downloaded. A successful message lists `https://sole-map-typo3-test.ddev.site` as the primary URL.

Useful rule: run all remaining `ddev` commands from inside `~/sole-map-typo3-test`.

## 3. Install TYPO3 13.4

This extension supports TYPO3 12.4 and 13.4. Use 13.4 for this test even if a newer TYPO3 release exists:

```bash
ddev composer create-project "typo3/cms-base-distribution:^13.4"
```

Composer downloads TYPO3 and creates directories such as `public`, `vendor`, and `config`. Wait for the command to finish successfully.

Run TYPO3's initial setup:

```bash
ddev typo3 setup \
    --admin-user-password="LocalTest-1234" \
    --driver=mysqli \
    --server-type=other \
    --dbname=db \
    --username=db \
    --password=db \
    --port=3306 \
    --host=db \
    --admin-username=admin \
    --admin-email=admin@example.com \
    --project-name="SoLE Map Test" \
    --create-site="https://sole-map-typo3-test.ddev.site" \
    --force
```

The backslashes mean that the command continues on the next line. You can paste the entire block at once.

The disposable login is:

```text
Username: admin
Password: LocalTest-1234
```

Do not reuse this password for a real account. It is visible in your terminal history and is only suitable for this disposable test.

## 4. Open TYPO3 for the first time

Open the backend login:

```bash
ddev launch /typo3/
```

Log in with the temporary credentials above. The TYPO3 backend has a module menu on the left and a page tree next to it.

If the browser shows a certificate warning, return to Terminal, run the following command, accept the macOS prompt, and launch the backend again:

```bash
ddev trust
```

## 5. Install the SoLE map extension

Keep the TYPO3 test folder open in Terminal. You need the absolute path to `sole_map-1.0.0.zip` from this repository.

In Finder, locate the ZIP, hold Option, right-click it, and choose **Copy ... as Pathname**. Replace `/FULL/PATH/TO/` in the following command with that path:

```bash
mkdir -p packages
unzip "/FULL/PATH/TO/sole_map-1.0.0.zip" -d packages
```

After extraction, this file must exist:

```text
packages/sole_map/composer.json
```

Check it:

```bash
ls packages/sole_map/composer.json
```

Tell Composer that `packages/sole_map` is a local package, then install it:

```bash
ddev composer config repositories.sole-map path packages/sole_map
ddev composer require ph-ludwigsburg/sole-map:@dev
```

Apply TYPO3 extension setup and clear caches:

```bash
ddev typo3 extension:setup
ddev typo3 cache:flush
```

Confirm that Composer sees the extension:

```bash
ddev composer show ph-ludwigsburg/sole-map
```

The output should contain the package name and version `1.0.0`.

## 6. Create a minimal visible TYPO3 page

The base TYPO3 distribution intentionally has no visual site theme. For this disposable test, create the smallest possible page renderer.

### Create the root TypoScript template

1. Return to the TYPO3 backend in the browser.
2. In the left module menu, choose **Web > TypoScript** or **Web > Template**. The label depends on the exact TYPO3 13 patch release.
3. Select the root page created during setup in the page tree.
4. Choose **Create template for a new site** if TYPO3 says that no template exists.
5. Edit the template record.
6. Under **Includes**, add **Fluid Content Elements** to the selected items.
7. In the **Setup** field, enter:

   ```typoscript
   page = PAGE
   page {
       10 < styles.content.get
   }
   ```

8. Save the template.
9. Use the toolbar cache menu to choose **Flush frontend caches**.

This simple setup renders the content elements from the page's Normal column. It is deliberately plain and exists only for testing.

### Make sure the page is public

1. Choose **Web > Page**.
2. Select the root page.
3. If its page icon shows a red disabled symbol, right-click the page and choose **Enable**.
4. Save any requested change.

## 7. Add the map plugin

1. In **Web > Page**, select the public root page.
2. Find the **Normal** content column.
3. Click **+ Content** or **Create new content element**.
4. Open the **Plugins** tab or category.
5. Select **SoLE Kooperationspartner-Karte**.
6. Give the element a header only if you want one.
7. Save and close the content element.

Depending on the backend layout, TYPO3 may first show a generic **Plugin** content element. In that case, create it and select **SoLE Kooperationspartner-Karte** from its plugin dropdown.

## 8. Test the frontend

Open the site:

```bash
ddev launch
```

The page should show the map, filters, and results. Complete this checklist:

- OpenStreetMap tiles appear rather than a gray area.
- The results count matches the valid rows in the CSV.
- Every marker opens a popup.
- Search finds names and addresses.
- Category and cooperation filters work.
- Sorting changes the result order.
- Export downloads a CSV file.
- Share copies a local URL.
- The layout remains usable in a narrow browser window.

Open the browser developer tools with Option+Command+I on macOS. Check the **Console** for red errors and the **Network** panel for failed red requests.

## 9. Test a data update

Replace the extension's CSV inside the test project:

```text
~/sole-map-typo3-test/packages/sole_map/Resources/Public/Data/PraxisstellenSoLE_Karte.csv
```

Then clear TYPO3 caches:

```bash
ddev typo3 cache:flush
```

Hard-refresh the browser with Shift+Command+R. Confirm that the changed locations and result count appear.

Because Composer installs this path package as a symlink, edits under `packages/sole_map` are reflected in the test installation. Do not edit the copy under `vendor`, which Composer can replace.

## 10. Stop or delete the test site

To stop the containers but keep the test for another day:

```bash
ddev stop
```

To start it again later:

```bash
cd ~/sole-map-typo3-test
ddev start
```

To permanently remove the DDEV containers and database, run this from the test directory:

```bash
ddev delete --omit-snapshot --yes
```

After DDEV confirms deletion, move out of the directory:

```bash
cd ~
```

You can now move `sole-map-typo3-test` to the Trash in Finder. Verify the folder name carefully before deleting it. This cleanup does not affect the original map repository or any remote TYPO3 website.

## Troubleshooting

### `ddev: command not found`

DDEV is not installed or Terminal has not reloaded its command path. Install DDEV, close Terminal completely, reopen it, and run `ddev version`.

### DDEV says Docker is unavailable

Start Docker Desktop or OrbStack, wait until it is ready, and run `ddev start` again.

### The project URL does not open

From `~/sole-map-typo3-test`, run:

```bash
ddev describe
ddev restart
```

Use the primary URL printed by `ddev describe`.

### Composer cannot find `ph-ludwigsburg/sole-map`

Verify the extracted path:

```bash
ls packages/sole_map/composer.json
ddev composer config repositories.sole-map
```

If the first command fails, the ZIP was extracted to the wrong directory. The expected path is exactly `packages/sole_map/composer.json`.

### The plugin is missing from the new-content wizard

Run:

```bash
ddev composer show ph-ludwigsburg/sole-map
ddev typo3 extension:setup
ddev typo3 cache:flush
```

Then reload the TYPO3 backend.

### The frontend is blank or says no TypoScript was found

Repeat section 6. Confirm that the root page has a template, **Fluid Content Elements** is included, and the `page = PAGE` setup was saved.

### The plugin renders but the map is gray or empty

Open the browser developer tools and inspect Console and Network errors:

- A failed `PraxisstellenSoLE_Karte.csv` request means the packaged data file is missing or inaccessible.
- Failed requests to `cdnjs.cloudflare.com` or `cdn.jsdelivr.net` indicate a network or Content Security Policy restriction.
- Failed requests to `tile.openstreetmap.org` indicate that map tiles are blocked or the computer is offline.

### TYPO3 reports an unexpected server error

Display recent container logs:

```bash
ddev logs
ddev typo3 cache:flush
```

Copy the exact error message when asking a TYPO3 administrator for help.

## Official references

- [TYPO3 13.4 installation with DDEV](https://docs.typo3.org/m/typo3/tutorial-getting-started/13.4/en-us/Installation/Install.html)
- [DDEV TYPO3 quick start](https://docs.ddev.com/en/stable/users/quickstart/#typo3)
- [DDEV installation](https://docs.ddev.com/en/stable/users/install/ddev-installation/)