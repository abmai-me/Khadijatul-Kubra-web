(function(blocks, editor, i18n, element) {
	// Set up variables
	var el = element.createElement,
		atts = {
				type: {
					type: 'string',
					default: 'default'
				},
				post_type: {
					type: 'string',
					default: 'post'
				},
				taxonomy: {
					type: 'string',
					default: 'category'
				},
				cat: {
					type: 'string',
					default: ''
				},
				pagination: {
					type: 'string',
					default: 'none'
				},
				// Filters
				show_filters: {
					type: 'boolean',
					default: false
				},
				filters_title: {
					type: 'string',
					default: ''
				},
				filters_subtitle: {
					type: 'string',
					default: ''
				},
				filters_title_align: {
					type: 'string',
					default: 'left'
				},
				filters_taxonomy: {
					type: 'string',
					default: 'category'
				},
				filters_ids: {
					type: 'string',
					default: ''
				},
				filters_all: {
					type: 'boolean',
					default: true
				},
				filters_all_text: {
					type: 'string',
					default: i18n.__( 'All' )
				},
				// Details
				meta_parts: {
					type: 'string',
					default: 'date,views,comments'
				},
				image_position: {
					type: 'string',
					default: 'top'
				},
				image_width: {
					type: 'number',
					default: 40
				},
				image_ratio: {
					type: 'string',
					default: 'none'
				},
				date_format: {
					type: 'string',
					default: ''
				},
				excerpt_length: {
					type: 'string',
					default: ''
				},
				text_align: {
					type: 'string',
					default: 'left'
				},
				on_plate: {
					type: 'boolean',
					default: false
				},
				numbers: {
					type: 'boolean',
					default: false
				},
				hide_excerpt: {
					type: 'boolean',
					default: false
				},
				no_links: {
					type: 'boolean',
					default: false
				},
				more_text: {
					type: 'string',
					default: i18n.__( 'Read more' )
				},
				// Query attributes
				ids: {
					type: 'string',
					default: ''
				},
				count: {
					type: 'number',
					default: 2
				},
				columns: {
					type: 'number',
					default: 2
				},
				offset: {
					type: 'number',
					default: 0
				},
				orderby: {
					type: 'string',
					default: 'none'
				},
				order: {
					type: 'string',
					default: 'asc'
				},
				// Slider attributes
				slider: {
					type: 'boolean',
					default: false
				},
				slides_space: {
					type: 'number',
					default: 0
				},
				slides_centered: {
					type: 'boolean',
					default: false
				},
				slides_overflow: {
					type: 'boolean',
					default: false
				},
				slider_mouse_wheel: {
					type: 'boolean',
					default: false
				},
				slider_autoplay: {
					type: 'boolean',
					default: true
				},
				slider_controls: {
					type: 'string',
					default: 'none'
				},
				slider_pagination: {
					type: 'string',
					default: 'none'
				},
				// Title attributes
				title_style: {
					type: 'string',
					default: ''
				},
				title_tag: {
					type: 'string',
					default: ''
				},
				title_align: {
					type: 'string',
					default: ''
				},
				title_color: {
					type: 'string',
					default: ''
				},
				title_color2: {
					type: 'string',
					default: ''
				},
				gradient_direction: {
					type: 'number',
					default: 0
				},
				title: {
					type: 'string',
					default: i18n.__( 'Blogger' )
				},
				subtitle: {
					type: 'string',
					default: ''
				},
				description: {
					type: 'string',
					default: ''
				},
				// Button attributes
				link: {
					type: 'string',
					default: ''
				},
				link_text: {
					type: 'string',
					default: ''
				},
				link_style: {
					type: 'string',
					default: ''
				},
				link_image: {
					type: 'number',
					default: 0
				},
				link_image_url: {
					type: 'string',
					default: ''
				},
				// ID, Class, CSS attributes
				id: {
					type: 'string',
					default: ''
				},
				class: {
					type: 'string',
					default: ''
				},
				className: {
					type: 'string',
					default: ''
				},
				css: {
					type: 'string',
					default: ''
				},
				// Reload block - hidden option
				reload: {
					type: 'string'
				},
			};

	// Add templates
	for (var l in TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_layouts']['sc_blogger']) {
		if (l == 'length' || ! TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_blogger_template_'+l]) continue;
		var opts = TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_blogger_template_'+l],
			defa = '';
		if (opts) {
			for (var i in opts) {
				defa = i;
				break;
			}
		}
		atts['template_' + l] = {
			type: 'string',
			default: defa
		}
	}

	// Register Block - Blogger
	blocks.registerBlockType(
		'trx-addons/blogger', {
			title: i18n.__( 'Blogger' ),
			description: i18n.__( "Display posts from specified category in many styles" ),
			icon: 'welcome-widgets-menus',
			category: 'trx-addons-blocks',
			attributes: atts,
			edit: function(props) {
				if (!TRX_ADDONS_STORAGE['gutenberg_sc_params']['taxonomies'][props.attributes.post_type].hasOwnProperty(props.attributes.taxonomy)) {
					props.attributes.taxonomy = 0;
				}
				return trx_addons_gutenberg_block_params(
					{
						'render': true,
						'render_button': true,
						'general_params': el(
							'div', {},
							// Layout
							trx_addons_gutenberg_add_param(
								{
									'name': 'type',
									'title': i18n.__( 'Layout' ),
									'type': 'select',
									'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_layouts']['sc_blogger'] )
								}, props
							),
							// Post type
							trx_addons_gutenberg_add_param(
								{
									'name': 'post_type',
									'title': i18n.__( 'Post type' ),
									'type': 'select',
									'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['posts_types'] )
								}, props
							),
							// Taxonomy
							trx_addons_gutenberg_add_param(
								{
									'name': 'taxonomy',
									'title': i18n.__( 'Taxonomy' ),
									'type': 'select',
									'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['taxonomies'][props.attributes.post_type], true )
								}, props
							),
							// Category
							trx_addons_gutenberg_add_param(
								{
									'name': 'cat',
									'title': i18n.__( 'Category' ),
									'type': 'select',
									'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['categories'][props.attributes.taxonomy], true )
								}, props
							),
							// Pagination
							trx_addons_gutenberg_add_param(
								{
									'name': 'pagination',
									'title': i18n.__( 'Pagination' ),
									'descr': i18n.__( "Add pagination links after posts. Attention! If using slider - pagination is not allowed!" ),
									'type': 'select',
									'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_paginations'] )
								}, props
							),
						),
						'additional_params': el(
							'div', {},
							// Query params
							trx_addons_gutenberg_add_param_query( props ),
							// Filters params
							trx_addons_gutenberg_add_param_filters( props ),
							// Details params
							trx_addons_gutenberg_add_param_sc_blogger_details( props ),
							// Title params
							trx_addons_gutenberg_add_param_title( props, true ),
							// Slider params
							trx_addons_gutenberg_add_param_slider( props ),
							// ID, Class, CSS params
							trx_addons_gutenberg_add_param_id( props )
						)
					}, props
				);
			},
			save: function(props) {
				return el( '', null );
			},
		}
	);

	// Return details params
	//-------------------------------------------
	function trx_addons_gutenberg_add_param_sc_blogger_details(props) {
		var el     = window.wp.element.createElement;
		var i18n   = window.wp.i18n;
		var params = [
			// Image position
			trx_addons_gutenberg_add_param(
				{
					'name': 'image_position',
					'title': i18n.__( 'Image position' ),
					'type': 'select',
					'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_blogger_image_positions'] ),
					'dependency': {
						'type': [ 'default', 'list' ]
					}
				}, props
			),
			// Image width
			trx_addons_gutenberg_add_param(
				{
					'name': 'image_width',
					'title': i18n.__( 'Image width (in %)' ),
					'type': 'number',
					'min': 20,
					'max': 80,
					'dependency': {
						'type': [ 'default', 'list' ]
					}
				}, props
			),
			// Image ratio
			trx_addons_gutenberg_add_param(
				{
					'name': 'image_ratio',
					'title': i18n.__( 'Image ratio' ),
					'type': 'select',
					'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_blogger_image_ratio'] ),
					'dependency': {
						'type': [ 'default', 'list' ],
						'image_position': ['left', 'right', 'alter']
					}
				}, props
			),
			// Meta parts
			trx_addons_gutenberg_add_param(
				{
					'name': 'meta_parts',
					'title': i18n.__( 'Choose meta parts' ),
					'type': 'select',
					'multiple': true,
					'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['meta_parts'] ),
					'dependency': {
						'type': [ 'default', 'list' ]
					}
				}, props
			),
			// Date format
			trx_addons_gutenberg_add_param(
				{
					'name': 'date_format',
					'title': i18n.__( "Date format" ),
					'type': 'text',
					'dependency': {
						'type': [ 'default', 'list' ]
					}
				}, props
			),
			// Text alignment
			trx_addons_gutenberg_add_param(
				{
					'name': 'text_align',
					'title': i18n.__( 'Text alignment' ),
					'type': 'select',
					'options': trx_addons_gutenberg_get_lists( TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_aligns'] ),
					'dependency': {
						'type': [ 'default', 'list' ]
					}
				}, props
			),
			// On plate
			trx_addons_gutenberg_add_param(
				{
					'name': 'on_plate',
					'title': i18n.__( 'On plate' ),
					'type': 'boolean',
					'dependency': {
						'type': [ 'default', 'list' ]
					}
				}, props
			),
			// Show numbers
			trx_addons_gutenberg_add_param(
				{
					'name': 'numbers',
					'title': i18n.__( 'Show numbers' ),
					'type': 'boolean',
					'dependency': {
						'type': [ 'list' ]
					}
				}, props
			),
			// Hide excerpt
			trx_addons_gutenberg_add_param(
				{
					'name': 'hide_excerpt',
					'title': i18n.__( 'Hide excerpt' ),
					'type': 'boolean'
				}, props
			),
			// Text length
			trx_addons_gutenberg_add_param(
				{
					'name': 'excerpt_length',
					'title': i18n.__( "Text length (in words)" ),
					'type': 'text',
					'dependency': {
						'hide_excerpt': [ false ]
					}
				}, props
			),
			// Disable links
			trx_addons_gutenberg_add_param(
				{
					'name': 'no_links',
					'title': i18n.__( 'Disable links' ),
					'type': 'boolean'
				}, props
			),
			// 'More' text
			trx_addons_gutenberg_add_param(
				{
					'name': 'more_text',
					'title': i18n.__( "'More' text" ),
					'type': 'text',
					'dependency': {
						'no_links': [false]
					}
				}, props
			)
		];

		// Add templates
		for (var l in TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_layouts']['sc_blogger']) {
			if (l == 'length' || ! TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_blogger_template_'+l]) continue;
			var opts = TRX_ADDONS_STORAGE['gutenberg_sc_params']['sc_blogger_template_'+l];
			if (!opts) continue;
			params.unshift( trx_addons_gutenberg_add_param(
				{
					'name': 'template_' + l,
					'title': i18n.__( 'Template' ),
					'type': 'select',
					'options': trx_addons_gutenberg_get_lists( opts ),
					'dependency': {
						'type': [ l ]
					}
				}, props
			) );
		}

		el(
			'div', {},
			params
		);

		return el(
			wp.element.Fragment,
			null,
			el(
				wp.editor.InspectorControls,
				{ key: 'inspector' },
				el(
					wp.components.PanelBody,
					{ title: i18n.__( "Details" ) },
					params
				)
			)
		);
	}
})( window.wp.blocks, window.wp.editor, window.wp.i18n, window.wp.element, );