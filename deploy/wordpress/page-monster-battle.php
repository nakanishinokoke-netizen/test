<?php
/**
 * Template Name: Monster Battle App
 * Description: Embeds the Monster Battle static app in an iframe.
 */

get_header();
?>
<div class="monster-battle-app" style="width:100%; min-height:800px;">
    <iframe src="<?php echo esc_url( home_url( '/monster-battle/' ) ); ?>" width="100%" height="860" style="border:none; min-height:860px;"></iframe>
</div>
<?php
get_footer();
