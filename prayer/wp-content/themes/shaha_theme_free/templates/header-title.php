<?php
/**
 * The template to display the page title and breadcrumbs
 *
 * @package WordPress
 * @subpackage Shaha
 * @since Shaha 1.0
 */

// Page (category, tag, archive, author) title

if ( shaha_need_page_title() ) {
	shaha_sc_layouts_showed('title', true);
	shaha_sc_layouts_showed('postmeta', true);
	?>
	<div class="top_panel_title sc_layouts_row sc_layouts_row_type_normal">
		<div class="content_wrap">
			<div class="sc_layouts_column sc_layouts_column_align_center">
				<div class="sc_layouts_item">
					<div class="sc_layouts_title sc_align_center">
						<?php
						// Post meta on the single post
						if ( is_single() )  {
							?><div class="sc_layouts_title_meta"><?php
								shaha_show_post_meta(apply_filters('shaha_filter_post_meta_args', array(
									'components' => 'categories,date,counters,edit',
									'counters' => 'views,comments,likes',
									'seo' => true
									), 'header', 1)
								);
							?></div><?php
						}
						
						// Blog/Post title
						?><div class="sc_layouts_title_title"><?php
							$shaha_blog_title = shaha_get_blog_title();
							$shaha_blog_title_text = $shaha_blog_title_class = $shaha_blog_title_link = $shaha_blog_title_link_text = '';
							if (is_array($shaha_blog_title)) {
								$shaha_blog_title_text = $shaha_blog_title['text'];
								$shaha_blog_title_class = !empty($shaha_blog_title['class']) ? ' '.$shaha_blog_title['class'] : '';
								$shaha_blog_title_link = !empty($shaha_blog_title['link']) ? $shaha_blog_title['link'] : '';
								$shaha_blog_title_link_text = !empty($shaha_blog_title['link_text']) ? $shaha_blog_title['link_text'] : '';
							} else
								$shaha_blog_title_text = $shaha_blog_title;
							?>
							<h1 itemprop="headline" class="sc_layouts_title_caption<?php echo esc_attr($shaha_blog_title_class); ?>"><?php
								$shaha_top_icon = shaha_get_category_icon();
								if (!empty($shaha_top_icon)) {
									$shaha_attr = shaha_getimagesize($shaha_top_icon);
									?><img src="<?php echo esc_url($shaha_top_icon); ?>" alt="<?php echo esc_html(basename($shaha_top_icon)); ?>" <?php if (!empty($shaha_attr[3])) shaha_show_layout($shaha_attr[3]);?>><?php
								}
								echo wp_kses_post($shaha_blog_title_text);
							?></h1>
							<?php
							if (!empty($shaha_blog_title_link) && !empty($shaha_blog_title_link_text)) {
								?><a href="<?php echo esc_url($shaha_blog_title_link); ?>" class="theme_button theme_button_small sc_layouts_title_link"><?php echo esc_html($shaha_blog_title_link_text); ?></a><?php
							}
							
							// Category/Tag description
							if ( is_category() || is_tag() || is_tax() ) 
								the_archive_description( '<div class="sc_layouts_title_description">', '</div>' );
		
						?></div><?php
	
						// Breadcrumbs
						?><div class="sc_layouts_title_breadcrumbs"><?php
							do_action( 'shaha_action_breadcrumbs');
						?></div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<?php
}
?>