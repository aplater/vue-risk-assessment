# Vue Risk Assessment 
A Risk Assessment questionnaire built with Vue and using Google Sheets for the backend.

## Portability and Integration
The code in this repo should be fairly portable, but there are a few things that will need to be accounted for.
This code is meant to be a starting point and will require modification to integrate properly within another site.

### Styles
The code was written to work within the ObserveIT WordPress theme, and as such, inherits styles from the themes
stylesheet. The theme is built on [Bootstrap](https://getbootstrap.com), so there are utility classes used within 
the component template code (`container`, `row`, `col-md-6`, etc). Since many of these utility classes are
common within other frameworks, it should be possible to search and replace the classnames with those
from your theme as necessary.

### Dependencies
For this repo, the `index.html` file includes some base styles from the ObserveIT site as well as some other
assets that are assumed dependencies. These include jQuery and Marketo. jQuery can probably be dropped, but
you would need to go through and replace some of the jQuery shortcut code.

### Marketo
When the user reaches the results screen, a form is presented that is currently provided by Marketo. The
form has fields that the calculated results depend on—Industry and Organization Size. Please see the 
`Results.vue` file for more detail.

### Google Sheets
Most of the backend of the form is provided by Google Sheets. The sheet must be published to the web and
the privacy needs to be publically visible. The sheet currently used on ObserveIT can be found 
[here](https://docs.google.com/spreadsheets/d/1Bd2nTEP0YTTnsQfR6NyJ6GjcNz30WykgM5HmFuv4uV0/edit#gid=0).

### Configuration
The configuration was provided to the vue component through the Wordpress system, so it had more information than
was necessary for functionality. I did my best to cut out unecessary properties in this example, but you still
may want to reorganize according to your needs.