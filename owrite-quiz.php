<?php
/**
 * Plugin Name: Owrite Quiz
 * Plugin URI:  https://github.com/aconymouse/owrite-quiz
 * Description: Tes kepribadian 16 tipe untuk WordPress. Dua bahasa, dua versi, hasil langsung di halaman, rekap respons di dashboard.
 * Version:     2.0.0
 * Author:      Hafidz Nc (Aconymous)
 * Author URI:  https://aconymous.com
 * License:     GPL-2.0-or-later
 * Text Domain: owrite-quiz
 */

if ( ! defined( 'ABSPATH' ) ) exit;

define( 'OMB_VER', '2.0.0' );
define( 'OMB_URL', plugin_dir_url( __FILE__ ) );

register_activation_hook( __FILE__, 'omb_install' );
function omb_install() {
	global $wpdb;
	$charset = $wpdb->get_charset_collate();
	$wpdb->query( "CREATE TABLE IF NOT EXISTS {$wpdb->prefix}omb_results (
		id bigint(20) NOT NULL AUTO_INCREMENT,
		email varchar(200) NOT NULL DEFAULT '',
		result_type varchar(10) NOT NULL,
		lang varchar(5) DEFAULT 'id',
		mode varchar(10) DEFAULT 'lengkap',
		scores text,
		created_at datetime DEFAULT CURRENT_TIMESTAMP,
		PRIMARY KEY (id)
	) $charset;" );
	omb_grant_caps();
}

add_action( 'init', 'omb_grant_caps' );
function omb_grant_caps() {
	$admin = get_role( 'administrator' );
	if ( ! $admin ) return;
	foreach ( [ 'owrite_manage_quiz', 'owrite_manage_mbti' ] as $cap ) {
		if ( ! $admin->has_cap( $cap ) ) $admin->add_cap( $cap );
	}
}

add_action( 'admin_menu', 'omb_register_menu' );
function omb_register_menu() {
	add_menu_page( 'Owrite Quiz', 'Owrite Quiz', 'owrite_manage_quiz', 'owrite-quiz', 'omb_hub_page', 'dashicons-awards', 4 );
	add_submenu_page( 'owrite-quiz', 'Dashboard', 'Dashboard', 'owrite_manage_quiz', 'owrite-quiz', 'omb_hub_page' );
	add_submenu_page( 'owrite-quiz', 'MBTI Test', 'MBTI Test', 'owrite_manage_mbti', 'owrite-mbti', 'omb_mbti_page' );
}

function omb_hub_page() {
	if ( ! current_user_can( 'owrite_manage_quiz' ) ) wp_die( 'Akses ditolak.' );
	global $wpdb;
	$total = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$wpdb->prefix}omb_results" );
	?>
	<div class="wrap">
		<h1>Owrite Quiz</h1>
		<p>Semua kuis yang terpasang di situs ini dan jumlah respons yang masuk.</p>
		<table class="widefat striped" style="max-width:640px">
			<thead><tr><th>Kuis</th><th>Shortcode</th><th>Respons</th><th></th></tr></thead>
			<tbody>
				<tr>
					<td><strong>MBTI Test</strong></td>
					<td><code>[owrite_mbti]</code></td>
					<td><?php echo $total; ?></td>
					<td><a class="button button-small" href="<?php echo esc_url( admin_url( 'admin.php?page=owrite-mbti' ) ); ?>">Kelola</a></td>
				</tr>
			</tbody>
		</table>
	</div>
	<?php
}

function omb_mbti_page() {
	if ( ! current_user_can( 'owrite_manage_mbti' ) ) wp_die( 'Akses ditolak.' );
	global $wpdb;
	$table = $wpdb->prefix . 'omb_results';

	if ( isset( $_POST['omb_delete'] ) && check_admin_referer( 'omb_admin' ) ) {
		$wpdb->delete( $table, [ 'id' => (int) $_POST['omb_delete'] ] );
	}
	if ( isset( $_POST['omb_delete_all'] ) && check_admin_referer( 'omb_admin' ) ) {
		$wpdb->query( "TRUNCATE TABLE {$table}" );
	}
	if ( isset( $_GET['export'] ) && $_GET['export'] === 'csv' && check_admin_referer( 'omb_export' ) ) {
		$rows = $wpdb->get_results( "SELECT id,email,result_type,lang,mode,created_at FROM {$table} ORDER BY created_at DESC", ARRAY_A );
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( 'Content-Disposition: attachment; filename="mbti-' . gmdate( 'Y-m-d' ) . '.csv"' );
		$out = fopen( 'php://output', 'w' );
		fprintf( $out, chr( 0xEF ) . chr( 0xBB ) . chr( 0xBF ) );
		fputcsv( $out, [ 'ID', 'Email', 'Tipe', 'Bahasa', 'Versi', 'Tanggal' ] );
		foreach ( $rows as $row ) fputcsv( $out, $row );
		fclose( $out );
		exit;
	}

	$results   = $wpdb->get_results( "SELECT * FROM {$table} ORDER BY created_at DESC LIMIT 200" );
	$total     = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table}" );
	$w_email   = (int) $wpdb->get_var( "SELECT COUNT(*) FROM {$table} WHERE email != ''" );
	$top_types = $wpdb->get_results( "SELECT result_type, COUNT(*) AS cnt FROM {$table} GROUP BY result_type ORDER BY cnt DESC LIMIT 6" );
	$export    = wp_nonce_url( admin_url( 'admin.php?page=owrite-mbti&export=csv' ), 'omb_export' );
	?>
	<div class="wrap">
		<h1>MBTI Test</h1>
		<p>Shortcode <code>[owrite_mbti]</code>. Respons tersimpan saat peserta selesai menjawab, email hanya kalau peserta minta PDF.</p>

		<table class="widefat" style="max-width:640px;margin-bottom:16px">
			<tbody>
				<tr><td>Total respons</td><td><strong><?php echo $total; ?></strong></td></tr>
				<tr><td>Minta PDF lewat email</td><td><strong><?php echo $w_email; ?></strong></td></tr>
				<?php foreach ( (array) $top_types as $type ) : ?>
				<tr><td>Tipe <?php echo esc_html( $type->result_type ); ?></td><td><?php echo (int) $type->cnt; ?></td></tr>
				<?php endforeach; ?>
			</tbody>
		</table>

		<p>
			<a class="button button-primary" href="<?php echo esc_url( $export ); ?>">Ekspor CSV</a>
			<form method="post" style="display:inline" onsubmit="return confirm('Hapus semua respons? Tidak bisa dikembalikan.')">
				<?php wp_nonce_field( 'omb_admin' ); ?>
				<input type="hidden" name="omb_delete_all" value="1">
				<button class="button">Hapus semua</button>
			</form>
		</p>

		<?php if ( empty( $results ) ) : ?>
			<p class="description">Belum ada respons.</p>
		<?php else : ?>
		<table class="wp-list-table widefat fixed striped">
			<thead>
				<tr>
					<th style="width:48px">#</th>
					<th>Email</th>
					<th style="width:70px">Tipe</th>
					<th style="width:70px">Bahasa</th>
					<th style="width:90px">Versi</th>
					<th style="width:150px">Tanggal</th>
					<th style="width:80px"></th>
				</tr>
			</thead>
			<tbody>
			<?php foreach ( $results as $row ) : ?>
				<tr>
					<td><?php echo (int) $row->id; ?></td>
					<td><?php echo $row->email ? '<a href="mailto:' . esc_attr( $row->email ) . '">' . esc_html( $row->email ) . '</a>' : '&mdash;'; ?></td>
					<td><strong><?php echo esc_html( $row->result_type ); ?></strong></td>
					<td><?php echo esc_html( strtoupper( $row->lang ?: 'id' ) ); ?></td>
					<td><?php echo esc_html( $row->mode === 'singkat' ? 'Singkat' : 'Lengkap' ); ?></td>
					<td><?php echo esc_html( $row->created_at ); ?></td>
					<td>
						<form method="post">
							<?php wp_nonce_field( 'omb_admin' ); ?>
							<input type="hidden" name="omb_delete" value="<?php echo (int) $row->id; ?>">
							<button class="button button-small" onclick="return confirm('Hapus respons ini?')">Hapus</button>
						</form>
					</td>
				</tr>
			<?php endforeach; ?>
			</tbody>
		</table>
		<?php endif; ?>
	</div>
	<?php
}

function omb_page_has_quiz() {
	global $post;
	return is_singular() && $post instanceof WP_Post && has_shortcode( $post->post_content, 'owrite_mbti' );
}

add_action( 'template_redirect', 'omb_security_headers' );
function omb_security_headers() {
	if ( ! omb_page_has_quiz() ) return;
	header( 'X-Content-Type-Options: nosniff' );
	header( 'Referrer-Policy: strict-origin-when-cross-origin' );
	header( 'Permissions-Policy: camera=(), microphone=(), geolocation=()' );
}

add_action( 'wp_head', 'omb_schema' );
function omb_schema() {
	if ( ! omb_page_has_quiz() ) return;
	$url  = get_permalink();
	$data = [
		'@context' => 'https://schema.org',
		'@graph'   => [
			[
				'@type'               => 'Quiz',
				'name'                => get_the_title(),
				'url'                 => $url,
				'description'         => 'Tes kepribadian 16 tipe, 60 atau 24 soal, dua bahasa, hasil langsung tanpa daftar.',
				'inLanguage'          => [ 'id-ID', 'en-US' ],
				'isAccessibleForFree' => true,
				'numberOfQuestions'   => 60,
				'publisher'           => [ '@type' => 'Organization', 'name' => get_bloginfo( 'name' ), 'url' => home_url( '/' ) ],
			],
			[
				'@type'      => 'FAQPage',
				'mainEntity' => [
					[
						'@type'          => 'Question',
						'name'           => 'Apa itu tes MBTI?',
						'acceptedAnswer' => [ '@type' => 'Answer', 'text' => 'MBTI mengelompokkan kepribadian ke 16 tipe lewat empat pasang kecenderungan: Ekstrover/Introver, Pengindra/Intuitif, Pemikir/Perasa, Terencana/Spontan. Hasilnya kode empat huruf seperti INTJ.' ],
					],
					[
						'@type'          => 'Question',
						'name'           => 'Berapa lama tesnya?',
						'acceptedAnswer' => [ '@type' => 'Answer', 'text' => 'Versi lengkap 60 soal sekitar 12 menit, versi singkat 24 soal sekitar 5 menit.' ],
					],
					[
						'@type'          => 'Question',
						'name'           => 'Perlu daftar atau bayar?',
						'acceptedAnswer' => [ '@type' => 'Answer', 'text' => 'Tidak. Hasil langsung muncul di halaman. Email hanya diminta kalau kamu ingin PDF lengkapnya dikirim.' ],
					],
				],
			],
		],
	];
	echo '<script type="application/ld+json">' . wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) . '</script>' . "\n";
}

add_shortcode( 'owrite_mbti', 'omb_shortcode' );
function omb_shortcode() {
	wp_enqueue_style( 'omb-style', OMB_URL . 'assets/mbti.css', [], OMB_VER );
	wp_enqueue_script( 'omb-data', OMB_URL . 'assets/mbti-data.js', [], OMB_VER, true );
	wp_enqueue_script( 'jspdf', 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js', [], '2.5.1', true );
	wp_enqueue_script( 'omb-pdf', OMB_URL . 'assets/mbti-pdf.js', [ 'jspdf' ], OMB_VER, true );
	wp_enqueue_script( 'omb-script', OMB_URL . 'assets/mbti.js', [ 'omb-data', 'omb-pdf' ], OMB_VER, true );
	wp_localize_script( 'omb-script', 'OwriteMbtiConfig', [
		'ajax'  => admin_url( 'admin-ajax.php' ),
		'nonce' => wp_create_nonce( 'omb_nonce' ),
		'url'   => get_permalink(),
		'site'  => get_bloginfo( 'name' ),
	] );
	return '<div class="omb" data-omb lang="id"></div>';
}

add_filter( 'script_loader_tag', 'omb_jspdf_sri', 10, 2 );
function omb_jspdf_sri( $tag, $handle ) {
	if ( $handle !== 'jspdf' ) return $tag;
	return str_replace( '<script ', '<script crossorigin="anonymous" referrerpolicy="no-referrer" ', $tag );
}

add_action( 'wp_ajax_omb_mbti_save', 'omb_save' );
add_action( 'wp_ajax_nopriv_omb_mbti_save', 'omb_save' );
function omb_save() {
	check_ajax_referer( 'omb_nonce', 'nonce' );
	global $wpdb;
	$type   = sanitize_text_field( $_POST['type'] ?? '' );
	$lang   = in_array( $_POST['lang'] ?? '', [ 'id', 'en' ], true ) ? $_POST['lang'] : 'id';
	$mode   = in_array( $_POST['mode'] ?? '', [ 'lengkap', 'singkat' ], true ) ? $_POST['mode'] : 'lengkap';
	$scores = sanitize_textarea_field( $_POST['scores'] ?? '' );
	if ( ! preg_match( '/^[EI][SN][TF][JP]$/', $type ) ) wp_send_json_error( 'Tipe tidak dikenal.' );
	$wpdb->insert( $wpdb->prefix . 'omb_results', [
		'result_type' => $type,
		'lang'        => $lang,
		'mode'        => $mode,
		'scores'      => $scores,
	] );
	wp_send_json_success( [ 'id' => (int) $wpdb->insert_id ] );
}

add_action( 'wp_ajax_omb_email_pdf', 'omb_email_pdf' );
add_action( 'wp_ajax_nopriv_omb_email_pdf', 'omb_email_pdf' );
function omb_email_pdf() {
	check_ajax_referer( 'omb_nonce', 'nonce' );
	global $wpdb;
	$email = sanitize_email( trim( $_POST['email'] ?? '' ) );
	$type  = sanitize_text_field( $_POST['type'] ?? '' );
	$id    = (int) ( $_POST['id'] ?? 0 );
	$b64   = $_POST['pdf'] ?? '';

	if ( ! is_email( $email ) ) wp_send_json_error( 'Email tidak valid.' );
	if ( ! preg_match( '/^[EI][SN][TF][JP]$/', $type ) ) wp_send_json_error( 'Tipe tidak dikenal.' );
	if ( empty( $b64 ) ) wp_send_json_error( 'Tidak ada data PDF.' );

	$ip_key = 'omb_email_' . md5( $_SERVER['REMOTE_ADDR'] ?? '' );
	$count  = (int) get_transient( $ip_key );
	if ( $count >= 3 ) wp_send_json_error( 'Terlalu banyak permintaan. Coba lagi nanti.' );
	set_transient( $ip_key, $count + 1, HOUR_IN_SECONDS );

	$pdf = base64_decode( $b64, true );
	if ( $pdf === false || strlen( $pdf ) < 100 ) wp_send_json_error( 'Data PDF tidak valid.' );
	if ( strlen( $pdf ) > 5 * 1024 * 1024 ) wp_send_json_error( 'Ukuran PDF terlalu besar.' );
	if ( substr( $pdf, 0, 4 ) !== '%PDF' ) wp_send_json_error( 'Data PDF tidak valid.' );

	$upload = wp_upload_dir();
	$dir    = trailingslashit( $upload['basedir'] ) . 'omb-tmp/';
	if ( ! is_dir( $dir ) ) wp_mkdir_p( $dir );
	if ( ! file_exists( $dir . '.htaccess' ) ) file_put_contents( $dir . '.htaccess', 'deny from all' );
	if ( ! file_exists( $dir . 'index.html' ) ) file_put_contents( $dir . 'index.html', '' );

	$file = $dir . 'mbti-' . $type . '-' . wp_generate_password( 12, false ) . '.pdf';
	file_put_contents( $file, $pdf );

	if ( $id ) {
		$wpdb->update( $wpdb->prefix . 'omb_results', [ 'email' => $email ], [ 'id' => $id, 'result_type' => $type ] );
	}

	$site    = get_bloginfo( 'name' );
	$subject = sprintf( '[%s] Hasil tes kepribadian kamu: %s', $site, $type );
	$body    = "Hai,\n\nTipe kepribadian kamu $type. Penjelasan lengkapnya ada di PDF terlampir.\n\n" . get_permalink() . "\n\n$site";
	$headers = [ 'Content-Type: text/plain; charset=UTF-8' ];
	$sent    = wp_mail( $email, $subject, $body, $headers, [ $file ] );
	if ( file_exists( $file ) ) unlink( $file );

	if ( $sent ) wp_send_json_success( 'PDF terkirim ke ' . $email );
	wp_send_json_error( 'Gagal mengirim email.' );
}
