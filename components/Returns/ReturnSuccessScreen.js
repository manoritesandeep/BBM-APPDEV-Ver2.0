import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../constants/styles";
import {
  typography,
  spacing,
  scaleSize,
  deviceAdjustments,
} from "../../constants/responsive";
import Button from "../UI/Button";
import OutlinedButton from "../UI/OutlinedButton";
import SafeAreaWrapper from "../UI/SafeAreaWrapper";

function ReturnSuccessScreen({ route, navigation }) {
  const { returnNumber } = route.params;

  const handleViewReturns = () => {
    navigation.navigate("ReturnsListScreen");
  };

  const handleGoHome = () => {
    // Navigate to the Home tab in bottom navigation
    navigation.navigate("HomeScreen");
  };

  const handleTrackReturn = () => {
    navigation.navigate("ReturnTrackingScreen", { returnNumber });
  };

  return (
    <SafeAreaWrapper>
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            {/* Success Icon */}
            <View style={styles.iconContainer}>
              <View style={styles.iconBackground}>
                <Ionicons
                  name="checkmark-circle"
                  size={scaleSize(64)}
                  color={Colors.success600}
                />
              </View>
            </View>

            {/* Success Message */}
            <Text style={styles.successTitle}>Return Request Submitted!</Text>
            <Text style={styles.successMessage}>
              Your return request has been successfully submitted and is being
              processed.
            </Text>

            {/* Return Number */}
            <View style={styles.returnNumberContainer}>
              <Text style={styles.returnNumberLabel}>
                Return Request Number
              </Text>
              <Text style={styles.returnNumber}>{returnNumber}</Text>
            </View>

            {/* Next Steps */}
            <View style={styles.stepsContainer}>
              <Text style={styles.stepsTitle}>What happens next?</Text>

              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={Colors.primary500}
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Email Confirmation</Text>
                  <Text style={styles.stepDescription}>
                    You'll receive an email with return instructions and
                    shipping label within 24 hours.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons
                    name="cube-outline"
                    size={20}
                    color={Colors.primary500}
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Package & Ship</Text>
                  <Text style={styles.stepDescription}>
                    Pack the items securely and ship them back using the
                    provided label within 10 days.
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepIcon}>
                  <Ionicons
                    name="checkmark-outline"
                    size={20}
                    color={Colors.primary500}
                  />
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Processing & Refund</Text>
                  <Text style={styles.stepDescription}>
                    We'll inspect your items and process your refund within 3-5
                    business days.
                  </Text>
                </View>
              </View>
            </View>

            {/* Important Notes */}
            <View style={styles.notesContainer}>
              <Ionicons
                name="information-circle-outline"
                size={20}
                color={Colors.blue500}
              />
              <View style={styles.notesContent}>
                <Text style={styles.notesTitle}>Important Notes</Text>
                <Text style={styles.notesText}>
                  • Keep your return number for tracking{"\n"}• Items must be in
                  original condition{"\n"}• Email updates will be sent for
                  status changes{"\n"}• Contact support if you need assistance
                </Text>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Button onPress={handleTrackReturn} style={styles.primaryButton}>
            Track Return Status
          </Button>

          <View style={styles.secondaryActions}>
            <OutlinedButton
              onPress={handleViewReturns}
              style={styles.secondaryButton}
            >
              View All Returns
            </OutlinedButton>

            <OutlinedButton
              onPress={handleGoHome}
              style={styles.secondaryButton}
            >
              Continue Shopping
            </OutlinedButton>
          </View>
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    minHeight: "70%", // Ensure content takes minimum space
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  iconBackground: {
    width: scaleSize(120),
    height: scaleSize(120),
    borderRadius: scaleSize(60),
    backgroundColor: Colors.success50,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: Colors.success200,
  },
  successTitle: {
    ...typography.heading2,
    color: Colors.gray900,
    textAlign: "center",
    marginBottom: spacing.md,
  },
  successMessage: {
    ...typography.body,
    color: Colors.gray600,
    textAlign: "center",
    marginBottom: spacing.xl,
  },
  returnNumberContainer: {
    backgroundColor: Colors.white,
    padding: spacing.lg,
    borderRadius: scaleSize(12),
    alignItems: "center",
    marginBottom: spacing.xl,
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  returnNumberLabel: {
    ...typography.body2,
    color: Colors.gray600,
    marginBottom: spacing.sm,
  },
  returnNumber: {
    ...typography.heading3,
    color: Colors.primary600,
    fontWeight: "700",
  },
  stepsContainer: {
    width: "100%",
    marginBottom: spacing.xl,
  },
  stepsTitle: {
    ...typography.body,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.lg,
    textAlign: "center",
  },
  step: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: spacing.lg,
    backgroundColor: Colors.white,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    ...deviceAdjustments.shadow,
    shadowColor: Colors.gray900,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepIcon: {
    width: scaleSize(40),
    height: scaleSize(40),
    borderRadius: scaleSize(20),
    backgroundColor: Colors.primary50,
    justifyContent: "center",
    alignItems: "center",
    marginRight: spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.gray900,
    marginBottom: spacing.xs,
  },
  stepDescription: {
    ...typography.caption,
    color: Colors.gray600,
    lineHeight: scaleSize(16),
  },
  notesContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.blue50,
    padding: spacing.md,
    borderRadius: scaleSize(8),
    borderWidth: 1,
    borderColor: Colors.blue200,
    width: "100%",
  },
  notesContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  notesTitle: {
    ...typography.body2,
    fontWeight: "600",
    color: Colors.blue800,
    marginBottom: spacing.xs,
  },
  notesText: {
    ...typography.caption,
    color: Colors.blue700,
    lineHeight: scaleSize(16),
  },
  actions: {
    padding: spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  primaryButton: {
    marginBottom: spacing.md,
  },
  secondaryActions: {
    flexDirection: "row",
    gap: spacing.md,
  },
  secondaryButton: {
    flex: 1,
  },
});

export default ReturnSuccessScreen;
