/**
 * 重複した参加ドキュメントを削除するスクリプト
 *
 * 同じeventId + userIdの組み合わせで複数のドキュメントがある場合、
 * 最新の1件のみ残して他を削除します。
 *
 * 実行方法:
 * 1. Firebase Admin SDKのサービスアカウントキーをプロジェクトルートに配置
 *    - Firebase Console > プロジェクト設定 > サービスアカウント > 新しい秘密鍵を生成
 *    - ダウンロードしたファイルを `serviceAccountKey.json` として保存
 * 2. 以下のコマンドを実行:
 *    npx tsx scripts/cleanup-duplicate-participants.ts
 */

import { initializeApp, cert, ServiceAccount } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import * as fs from 'fs'
import * as path from 'path'

async function cleanupDuplicateParticipants() {
  // サービスアカウントキーのパス
  const serviceAccountPath = path.join(process.cwd(), 'serviceAccountKey.json')

  // ファイル存在チェック
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('Error: serviceAccountKey.json not found!')
    console.error('Please download the service account key from Firebase Console:')
    console.error('  1. Go to Firebase Console > Project Settings > Service Accounts')
    console.error('  2. Click "Generate new private key"')
    console.error('  3. Save the file as "serviceAccountKey.json" in the project root')
    process.exit(1)
  }

  // Firebase Admin初期化
  const serviceAccount = JSON.parse(
    fs.readFileSync(serviceAccountPath, 'utf-8')
  ) as ServiceAccount

  initializeApp({
    credential: cert(serviceAccount),
  })

  const db = getFirestore()

  console.log('Starting cleanup of duplicate participants...\n')

  // 全イベントを取得
  const eventsSnapshot = await db.collection('raceEvents').get()
  console.log(`Found ${eventsSnapshot.size} events`)

  let totalDuplicates = 0
  let totalDeleted = 0

  for (const eventDoc of eventsSnapshot.docs) {
    const eventId = eventDoc.id
    const eventTitle = eventDoc.data().title || 'Untitled'
    const participantsRef = db.collection(`raceEvents/${eventId}/participants`)
    const participantsSnapshot = await participantsRef.get()

    if (participantsSnapshot.empty) {
      continue
    }

    // userIdでグループ化
    const byUser = new Map<string, FirebaseFirestore.QueryDocumentSnapshot[]>()
    participantsSnapshot.docs.forEach((doc) => {
      const userId = doc.data().userId as string
      if (!byUser.has(userId)) {
        byUser.set(userId, [])
      }
      byUser.get(userId)!.push(doc)
    })

    // 重複があるユーザーの処理
    for (const [userId, docs] of byUser) {
      if (docs.length > 1) {
        const displayName = docs[0].data().displayName || userId
        console.log(`\nEvent "${eventTitle}" (${eventId}):`)
        console.log(`  User "${displayName}" has ${docs.length} documents`)
        totalDuplicates += docs.length - 1

        // createdAtで降順ソート（最新を残す）
        docs.sort((a, b) => {
          const aTime = a.data().createdAt?.toMillis?.() || 0
          const bTime = b.data().createdAt?.toMillis?.() || 0
          return bTime - aTime
        })

        // 最新以外を削除
        console.log(`  Keeping: ${docs[0].id} (status: ${docs[0].data().status})`)
        for (let i = 1; i < docs.length; i++) {
          const docToDelete = docs[i]
          console.log(`  Deleting: ${docToDelete.id} (status: ${docToDelete.data().status})`)
          await docToDelete.ref.delete()
          totalDeleted++
        }
      }
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('Cleanup complete!')
  console.log(`  Total duplicate entries found: ${totalDuplicates}`)
  console.log(`  Total documents deleted: ${totalDeleted}`)
}

// 実行
cleanupDuplicateParticipants().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
