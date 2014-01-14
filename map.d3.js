var map = {
	create: function () {

		var margin = {top: 10, left: 10, bottom: 10, right: 10},
			map = d3.select('#map'),
			width = parseInt(map.style('width'), 10),
			mapRatio = 0.5,
			height = width * mapRatio,
			centered;
		
		// check for margins and adjust width
		width = width - margin.left - margin.right;

		var projection = d3.geo.equirectangular()
			.rotate([-11.5,0])
			.translate([width / 2, height / 2])
			.scale(width / 2 / Math.PI);

		// set the map path
		var path = d3.geo.path().projection(projection);

		// add the svg
		var svg = d3.select('#map').append('svg');

		var outterg = svg.append('g').attr('transform', 'translate(0,0)');

		var g = outterg.append('g').attr('id', 'innerg');

		// Zoom in on shape
		// not currently used
		function clicked(d) {
			var x, y, scale, centroid;
			if (d && centered !== d) {
				centroid = path.centroid(d);
				x = centroid[0];
				y = centroid[1];
				scale = 2;
				centered = d;
			} else {
				x = width / 2;
				y = height / 2;
				scale = 1;
				centered = null;
			}

			g.selectAll('path')
				.classed('active', centered && function(d) { return d === centered; });

			g.transition()
				.duration(750)
				.attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')scale(' + scale + ')translate(' + -x + ',' + -y + ')')
				.style('stroke-width', 1.5 / scale + 'px');
		}

		// Hover actions
		var hoverClass = '';
		function hoverover () {
			hoverClass = this.dataset['group'] + '-hover';
			// $map.addClass(hoverClass);
			map.classed(hoverClass, true);
		}
		function hoverout () {
			// $map.removeClass(hoverClass);
			map.classed(hoverClass, false);
			hoverClass = '';
		}

		// window resize actions
		function resize() {
			width = parseInt(d3.select('#map').style('width'), 10);
			width = width - margin.left - margin.right;
			height = width * mapRatio;

			// update projection
			projection
				.translate([width / 2, height / 2])
				.scale(width / 2 / Math.PI);

			// resize the map container
			svg
				.style('width', width + 'px')
				.style('height', height + 'px');

			// resize the map
			svg.selectAll('.country').attr('d', path);
			positionButtons();
		}
		d3.select(window).on('resize', resize);

		// Create a group with individual paths for countries
		// not currently used
		function createCountry(country) {
			var classGroup;
			for (var i = 0, l = country.features.length; i < l; i += 1) {
				classGroup = country.features[i].properties.group.toLowerCase().replace(/ /g, '-');
				d3.select('#innerg').insert('path')
					.datum(country.features[i])
					.attr('data-name', country.features[i].properties.name)
					.attr('data-group', classGroup)
					.attr('class', 'country ' + classGroup)
					.attr('d', path)
					// .on('click', clicked)
					.on('mouseover', hoverover)
					.on('mouseout', hoverout);
			}
			
		}

		// Create as one group to get centre of whole area
		function createGroup(country) {
			var classGroup = country.features[0].properties.group.toLowerCase().replace(/ /g, '-'),
				xPos = 0,
				yPos = 0,
				textWidth;
			d3.select('#innerg').insert('path')
				.datum(country)
				.attr('data-group', classGroup)
				.attr('class', 'country country__all ' + classGroup)
				.attr('d', path)
				// .on('click', clicked)
				.on('mouseover', hoverover)
				.on('mouseout', hoverout);

			console.log(country)
			console.log(d3.geo.centroid(country))
			
			// If Europe we want to label a little to the left
			if (classGroup === 'europe') {
				xPos = '-18%';
				yPos = '3%';
			}
			// If America we want to label down a bit
			if (classGroup === 'americas') {
				xPos = '4%';
				yPos = '25%';
			}
			// If Africa we want to label down a bit
			if (classGroup === 'africa-and-middle-east') {
				xPos = '-9%';
				yPos = '0';
			}

			// Add group label
			// TODO: better way to style text like buttons?
			// d3.select('#innerg').insert('rect')
			// 	.datum(country)
			// 	// .attr('transform', function(d) {
			// 	// 	var pos = path.centroid(d);
			// 	// 	pos[1] = pos[1] - 18;
			// 	// 	return 'translate(' + pos + ')';
			// 	// })
			// 	.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
			// 	.attr('class', function(d) { return 'rect rect--' + classGroup; })
			// 	.attr('height', '22px')
			// 	.attr('width', '100px')
			// 	.attr('data-name', 'rect')
			// 	.attr('dy', yPos)
			// 	.attr('dx', xPos);
				
			d3.select('#innerg').insert('text')
				.datum(country)
				.attr('data-group', classGroup)
				.attr('class', function(d) { return 'label label--' + classGroup; })
				.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; })
				.attr('dy', yPos)
				.attr('dx', xPos)
				.text(country.features[0].properties.group)
				.on('mouseover', hoverover)
				.on('mouseout', hoverout);

		}

		function positionButtons () {
			svg.selectAll('.label').attr('d', path)
				.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; });
			svg.selectAll('.rect').attr('d', path)
				.attr('transform', function(d) { return 'translate(' + path.centroid(d) + ')'; });
		}


		d3.json('world.json', function(error, world) {
			var asia, africa, europe, americas;
			asia = {type: 'FeatureCollection', name: 'Asia', id:2, features: world.features.filter(function(d) { return d.properties.group=='Asia Pacific'; })};
			africa = {type: 'FeatureCollection', name: 'Africa', id:3, features: world.features.filter(function(d) { return d.properties.group=='Africa and Middle East'; })};
			europe = {type: 'FeatureCollection', name: 'Europe', id:4, features: world.features.filter(function(d) { return d.properties.group=='Europe'; })};
			americas = {type: 'FeatureCollection', name: 'Americas', id:5, features: world.features.filter(function(d) { return d.properties.group=='Americas'; })};

			// createCountry(africa)
			// createCountry(americas)
			// createCountry(asia)
			// createCountry(europe)
			
			createGroup(africa);
			createGroup(americas);
			createGroup(asia);
			createGroup(europe);
		});

		d3.select(self.frameElement).style('height', height + 'px');
	},
	init: function () {
		var map = document.getElementById('map');
		if (map) {
			// alternatively use the isIE8 global
			if (typeof d3 === 'undefined') {
				// do the IE8 thing
			} else {
				this.create(map);
			}
		}
	}
};
map.init();