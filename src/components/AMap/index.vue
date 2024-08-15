<template>
	<div class="map-box" :style="{ height: mapHeight }">
		<div id="amap" style="width: 100%; height: 100%"></div>
		<div class="map-search-box" v-if="search">
			<input id="mapinput" placeholder="请输入地址搜索位置" />
		</div>
	</div>
</template>

<script setup>
import { ref, shallowRef, computed, onMounted, onUnmounted } from 'vue';
import AMapLoader from '@amap/amap-jsapi-loader';

const map = shallowRef(null);
const markerList = ref([]);

const emits = defineEmits(['update:modelValue']);
const props = defineProps({
	modelValue: {
		type: Object,
		default: () => {
			return {
				address: '',
				lng: '',
				lat: '',
			};
		},
	},
	center: {//地图默认中心点（提供标记点时会自动缩放到能显示所有标记点）
		type: Array,
		default: [112.941189, 28.228315],
	},
	zoom: {// 缩放级别
		type: Number,
		default: 16,
	},
	markers: {//标记点数组
		type: Array,
		default: [],
		// default: [[112.880474, 28.236046]],
	},
	search: {
		type: Boolean,
		default: true,
	},
	height: {
		type: [String, Number],
		default: '300px',
	},
});

const options = computed(() => {
	return {
		center: props.center,
		zoom: props.zoom,
	};
});
const mapHeight = computed(() => {
	if (typeof props.height === 'string') return props.height;
	return props.height + 'px';
});

function initMap() {
	AMapLoader.load({
		key: 'bb09ae771a3fa908d89830a93bb4443a',
		version: '2.0',
		plugins: ['AMap.Geocoder'],
		AMapUI: {
			version: '1.1',
			plugins: ['overlay/SimpleMarker'],
		},
		Loca: { version: '2.0' },
	})
		.then(AMap => {
			map.value = new AMap.Map('amap', options.value);
			placeSearch(map.value);
			addMarkers(map.value, props.markers);
		})
		.catch(e => {
			console.log(e);
		});
}

/**
 * POI搜索 https://developer.amap.com/api/javascript-api/reference/search#m_AMap.Autocomplete
 * adcode参考值： https://lbs.amap.com/demo/jsapi-v2/example/district/district-pro
 */
function placeSearch(map = map.value) {
	if (!props.search) return;
	AMapLoader.load({
		plugins: ['AMap.PlaceSearch', 'AMap.AutoComplete'],
	}).then(AMap => {
		const autoComplete = new AMap.AutoComplete({
			city: '430000',
			input: 'mapinput',
		});
		const placeSearch = new AMap.PlaceSearch({
			city: '430000',
			autoFitView: true,
			map: map,
		});
		// 搜索框下拉项点击事件
		autoComplete.on('select', e => {
			map.clearMap();
			placeSearch.setCity(e.poi.adcode);
			placeSearch.search(e.poi.name);
		});
		// 搜索结果坐标点击事件
		placeSearch.on('markerClick', e => {
			const {
				address,
				location: { lng, lat },
			} = e.data;
			emits('update:modelValue', { lng, lat, address });
		});
	});
}

/**
 * 行政区查询 https://lbs.amap.com/api/javascript-api/guide/services/district-search
 */
function districtSearch(map = map.value) {
	AMapLoader.load({
		plugins: ['AMap.DistrictSearch'],
	}).then(AMap => {
		const districtSearch = new AMap.DistrictSearch({
			subdistrict: 0,
			extensions: 'all',
			level: 'province',
		});
	});
}

// 添加点标记
function addMarkers(map = map.value, data = [], address = '') {
	if (data.length === 0) return;
	AMapLoader.load({}).then(AMap => {
		map.clearMap();
		markerList.value = [];
		for (let position of data) {
			let marker = new AMap.Marker({
				position: position,
			});
			// marker.on('click', e => {
			// 	const {
			// 		lnglat: { lng, lat },
			// 	} = e;
			// 	emits('update:modelValue', { lng, lat, address });
			// });
			markerList.value.push(marker);
		}
		map.add(markerList.value);
		map.setFitView();
	});
}

// 移除单个点标记
function removeMarker(targetId) {
	let targetMarker;
	for (let item of marker.value) {
		let id = item.getExtData().id;
		if (id === targetId) {
			targetMarker = item;
			break;
		}
	}
	map.value.remove(targetMarker);
}

// 移除所有点标记
function removeMarkers() {
	map.value.remove(marker.value);
}

// 清除地图上所有覆盖物
function removerAllOverlay() {
	map.value.clearMap();
}

onMounted(() => {
	if (props.modelValue.lng && props.modelValue.lat && !props.markers.length) {
		props.markers = [[props.modelValue.lng, props.modelValue.lat]]
	}
	initMap();
});

onUnmounted(() => {
	map.value.destroy();
});
</script>

<style scoped>
.map-box {
	position: relative;
	width: 100%;
	border: 1px solid #dcdfe6;
	border-radius: 4px;
}
.map-search-box {
	position: absolute;
	left: 0;
	top: 0;
}
#mapinput {
	width: 280px;
	height: 30px;
  padding: 0 10px;
	margin-left: 4px;
	margin-top: 4px;
  border: 1px solid #eee;
  border-radius: 4px;
}
</style>
